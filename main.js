document.addEventListener("DOMContentLoaded", function() {
    if (typeof echarts === 'undefined') {
        console.error('ECharts 库未成功加载。');
        return;
    }

    // 全局变量
    var photosData;
    var routesData;

    // 获取照片数据和路线数据
    Promise.all([
        fetch('./data/photos.json').then(response => response.json()),
        fetch('./data/routes.json').then(response => response.json())
    ])
    .then(([photos, routes]) => {
        photosData = photos;
        routesData = routes;
        initMap(photosData, routesData);
    })
    .catch(error => {
        console.error('获取数据失败:', error);
    });

    function initMap(photos, routes) {
        var myMap = echarts.init(document.getElementById('map'));

        // 城市坐标映射
        var geoCoordMap = {
            '南京': [118.7969, 32.0603],
            '上海': [121.4737, 31.2304],
            '苏州': [120.6195, 31.2990],
            '香港': [114.1694, 22.3193],
            '北京': [116.4074, 39.9042],
            '广州': [113.2644, 23.1291],
            '深圳': [114.0579, 22.5431]
            // 如有更多城市，添加到此处
        };

        // 所有城市列表
        var allCities = [
            { name: '南京', hasPhoto: true },
            { name: '上海', hasPhoto: true },
            { name: '苏州', hasPhoto: true },
            { name: '香港', hasPhoto: true },
            { name: '北京', hasPhoto: false },
            { name: '广州', hasPhoto: false },
            { name: '深圳', hasPhoto: false }
            // 如有更多城市，添加到此处
        ];

        // 动态生成标记点数据
        var scatterData = allCities.map(function(city) {
            var coord = geoCoordMap[city.name];
            if (coord) {
                return {
                    name: city.name,
                    value: coord.concat(city.hasPhoto ? 50 : 30),
                    symbol: 'pin',
                    symbolSize: city.hasPhoto ? 50 : 30,
                    label: {
                        show: true,
                        formatter: '{b}',
                        position: 'top',
                        color: '#fff',
                        fontSize: 12,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        padding: [2, 4],
                        borderRadius: 3
                    },
                    itemStyle: {
                        color: city.hasPhoto ? '#FF6B6B' : '#1F78B4',
                        shadowBlur: 10,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                };
            }
        }).filter(item => item !== undefined);

        // 生成飞线数据
        var convertData = function(data) {
            var res = [];
            for (var i = 0; i < data.length; i++) {
                var fromCoord = geoCoordMap[data[i].from];
                var toCoord = geoCoordMap[data[i].to];
                if (fromCoord && toCoord) {
                    res.push({
                        fromName: data[i].from,
                        toName: data[i].to,
                        coords: [fromCoord, toCoord],
                        value: data[i].value || 1
                    });
                }
            }
            return res;
        };

        var flightLines = convertData(routes);

        var option = {
            backgroundColor: '#2E3B4E',
            tooltip: {
                trigger: 'item',
                formatter: function(params) {
                    if (params.seriesType === 'lines') {
                        return params.data.fromName + ' → ' + params.data.toName;
                    } else if (params.seriesType === 'scatter') {
                        return params.name;
                    } else {
                        return params.name;
                    }
                },
                backgroundColor: 'rgba(50, 50, 50, 0.7)',
                textStyle: {
                    color: '#fff'
                }
            },
            geo: {
                map: 'china',
                roam: true,
                zoom: 1.2,
                label: {
                    show: false,
                    color: '#fff'
                },
                itemStyle: {
                    normal: {
                        areaColor: '#3A3A3A',
                        borderColor: '#FFFFFF',
                        borderWidth: 1,
                        shadowBlur: 10,
                        shadowColor: 'rgba(0, 0, 0, 0.5)',
                        shadowOffsetX: 0,
                        shadowOffsetY: 5
                    },
                    emphasis: {
                        areaColor: '#FF6B6B'
                    }
                }
            },
            series: [
                {
                    name: '飞线',
                    type: 'lines',
                    coordinateSystem: 'geo',
                    zlevel: 2,
                    large: true,
                    effect: {
                        show: true,
                        constantSpeed: 30,
                        symbol: 'arrow',
                        symbolSize: 6,
                        trailLength: 0
                    },
                    lineStyle: {
                        normal: {
                            color: '#FF6B6B',
                            width: 1,
                            opacity: 0.6,
                            curveness: 0.2
                        }
                    },
                    data: flightLines
                },
                {
                    name: '标记点',
                    type: 'scatter',
                    coordinateSystem: 'geo',
                    data: scatterData
                }
            ]
        };

        myMap.setOption(option);

        // 窗口大小变化时，调整地图大小
        window.addEventListener('resize', function() {
            myMap.resize();
        });

        // 全局变量，用于控制幻灯片
        var tooltipSlideshowInterval;
        var currentTooltipPhotoIndex = 0;

        // 鼠标移动事件，显示照片幻灯片
        myMap.on('mousemove', function(params) {
            var tooltipPhoto = document.getElementById('tooltip-photo');
            if (params.componentType === 'series' && (params.seriesType === 'map' || params.seriesType === 'scatter')) {
                var cityName = params.name;
                var photo = photos.find(function(p) {
                    return p.location === cityName || (p.altNames && p.altNames.includes(cityName));
                });
                if (photo && photo.urls.length > 0) {
                    var tooltipImg = document.getElementById('tooltip-img');
                    tooltipPhoto.style.left = (params.event.event.pageX + 15) + 'px';
                    tooltipPhoto.style.top = (params.event.event.pageY + 15) + 'px';
                    tooltipPhoto.style.display = 'block';
                    tooltipPhoto.style.opacity = '1';

                    // 清除之前的定时器
                    clearInterval(tooltipSlideshowInterval);

                    // 重置索引
                    currentTooltipPhotoIndex = 0;

                    // 显示第一张照片
                    tooltipImg.src = photo.urls[currentTooltipPhotoIndex];

                    // 启动幻灯片
                    tooltipSlideshowInterval = setInterval(function() {
                        currentTooltipPhotoIndex = (currentTooltipPhotoIndex + 1) % photo.urls.length;
                        tooltipImg.src = photo.urls[currentTooltipPhotoIndex];
                    }, 2000); // 每隔2秒切换照片
                } else {
                    tooltipPhoto.style.opacity = '0';
                    setTimeout(function() {
                        tooltipPhoto.style.display = 'none';
                    }, 300);
                    // 清除定时器
                    clearInterval(tooltipSlideshowInterval);
                }
            } else {
                tooltipPhoto.style.opacity = '0';
                setTimeout(function() {
                    tooltipPhoto.style.display = 'none';
                }, 300);
                // 清除定时器
                clearInterval(tooltipSlideshowInterval);
            }
        });

        // 鼠标移出地图事件，停止幻灯片
        myMap.on('mouseout', function() {
            var tooltipPhoto = document.getElementById('tooltip-photo');
            tooltipPhoto.style.opacity = '0';
            setTimeout(function() {
                tooltipPhoto.style.display = 'none';
            }, 300);
            // 清除定时器
            clearInterval(tooltipSlideshowInterval);
        });

        // 点击地图事件
        myMap.on('click', function(params) {
            if (params.componentType === 'series' && (params.seriesType === 'map' || params.seriesType === 'scatter')) {
                var cityName = params.name;
                var photo = photos.find(function(p) {
                    return p.location === cityName || (p.altNames && p.altNames.includes(cityName));
                });
                var photoGallery = document.getElementById('photo-gallery');
                var infoPanel = document.getElementById('info-panel');
                photoGallery.innerHTML = ''; // 清空之前的照片
                infoPanel.innerHTML = ''; // 清空之前的信息
                if (photo && photo.urls.length > 0) {
                    photo.urls.forEach(function(url) {
                        var a = document.createElement('a');
                        a.href = url;
                        a.setAttribute('data-lightbox', photo.location);
                        var img = document.createElement('img');
                        img.src = url;
                        img.alt = photo.location + ' 照片';
                        img.loading = 'lazy';
                        a.appendChild(img);
                        photoGallery.appendChild(a);
                    });
                    // 显示描述信息
                    var description = document.createElement('p');
                    description.textContent = photo.description || '没有描述信息。';
                    infoPanel.appendChild(description);
                    // 滚动到照片展示区域
                    photoGallery.scrollIntoView({ behavior: 'smooth' });
                } else {
                    // 显示无照片提示
                    var msg = document.createElement('p');
                    msg.textContent = '暂无 ' + cityName + ' 的照片。';
                    photoGallery.appendChild(msg);
                    infoPanel.innerHTML = '';
                }
            }
        });

        // 搜索功能
        document.getElementById('search-button').addEventListener('click', function() {
            var query = document.getElementById('search-input').value.trim();
            if (query) {
                var photo = photos.find(function(p) {
                    return p.location === query || (p.altNames && p.altNames.includes(query));
                });
                if (photo) {
                    // 定位到城市
                    myMap.dispatchAction({
                        type: 'geoSelect',
                        name: photo.location
                    });
                    // 显示照片和信息
                    var photoGallery = document.getElementById('photo-gallery');
                    var infoPanel = document.getElementById('info-panel');
                    photoGallery.innerHTML = '';
                    infoPanel.innerHTML = '';
                    photo.urls.forEach(function(url) {
                        var a = document.createElement('a');
                        a.href = url;
                        a.setAttribute('data-lightbox', photo.location);
                        var img = document.createElement('img');
                        img.src = url;
                        img.alt = photo.location + ' 照片';
                        img.loading = 'lazy';
                        a.appendChild(img);
                        photoGallery.appendChild(a);
                    });
                    var description = document.createElement('p');
                    description.textContent = photo.description || '没有描述信息。';
                    infoPanel.appendChild(description);
                    photoGallery.scrollIntoView({ behavior: 'smooth' });
                } else {
                    alert('未找到该城市的照片。');
                }
            }
        });

        // 允许按下回车键进行搜索
        document.getElementById('search-input').addEventListener('keyup', function(event) {
            if (event.key === 'Enter') {
                document.getElementById('search-button').click();
            }
        });
    }
});

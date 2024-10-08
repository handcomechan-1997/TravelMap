document.addEventListener("DOMContentLoaded", function() {
    if (typeof echarts === 'undefined') {
        console.error('ECharts 库未成功加载。');
        return;
    }

    // 获取照片数据
    fetch('./data/photos.json')
        .then(response => response.json())
        .then(photos => {
            // 初始化地图和事件处理程序
            initMap(photos);
        })
        .catch(error => {
            console.error('获取照片数据失败:', error);
        });

    // 定义 initMap 函数
    function initMap(photos) {
        // 初始化地图
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

        // 动态生成地图数据
        var mapData = allCities.map(city => ({
            name: city.name,
            value: Math.random() * 100, // 您可以根据需要设置实际的值
            hasPhoto: city.hasPhoto
        }));

        // 动态生成标记点数据
        var scatterData = allCities.map(function(city) {
            var coord = geoCoordMap[city.name];
            if (coord) {
                return {
                    name: city.name,
                    value: coord.concat(1),
                    symbol: city.hasPhoto ? 'circle' : 'emptyCircle',
                    symbolSize: city.hasPhoto ? 20 : 12,
                    label: { show: false },
                    itemStyle: { color: city.hasPhoto ? '#e74c3c' : '#95a5a6' },
                    emphasis: {
                        label: {
                            show: true,
                            formatter: '{b}',
                            color: '#fff',
                            fontSize: 14,
                            fontWeight: 'bold'
                        }
                    }
                };
            }
        }).filter(item => item !== undefined);

        // 设置地图选项
        var option = {
            tooltip: {
                trigger: 'item',
                formatter: function(params) {
                    return params.name;
                },
                backgroundColor: 'rgba(50, 50, 50, 0.7)',
                textStyle: {
                    color: '#fff'
                }
            },
            visualMap: {
                show: false,
                min: 0,
                max: 100,
                inRange: {
                    color: ['#e0f7fa', '#006064']
                }
            },
            geo: {
                map: 'china',
                roam: true,
                label: {
                    emphasis: {
                        show: false
                    }
                },
                itemStyle: {
                    normal: {
                        areaColor: '#e0f7fa',
                        borderColor: '#b0bec5',
                        borderWidth: 1
                    },
                    emphasis: {
                        areaColor: '#80deea'
                    }
                }
            },
            series: [
                {
                    name: '中国',
                    type: 'map',
                    geoIndex: 0,
                    roam: false,
                    label: {
                        show: true,
                        color: '#37474f',
                        fontSize: 12,
                        fontWeight: 'bold'
                    },
                    data: mapData
                },
                {
                    name: '标记点',
                    type: 'scatter',
                    coordinateSystem: 'geo',
                    data: scatterData,
                    symbolSize: function(val) {
                        return val[2];
                    },
                    label: {
                        show: false
                    },
                    itemStyle: {
                        color: function(params) {
                            return params.data.itemStyle.color;
                        }
                    },
                    emphasis: {
                        label: {
                            show: true,
                            formatter: '{b}',
                            color: '#fff',
                            fontSize: 14,
                            fontWeight: 'bold'
                        }
                    }
                }
                // 如有旅行路线数据，可以添加到 series 中
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

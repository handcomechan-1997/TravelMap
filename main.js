fetch('./data/photos.json')
    .then(response => response.json())
    .then(photos => {
        // 初始化地图和事件处理程序
        initMap(photos);
    })
    .catch(error => {
        console.error('获取照片数据失败:', error);
    });

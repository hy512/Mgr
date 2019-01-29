(function(w, d) {
    "use strict"
    // 服务器配置
    var configuration = {
        apis: {
            "columns": "/index/columns"
        }
    };

    // 测试用 axios
    var test = axios.create({
        method: "GET",
        baseURL: "http://result.eolinker.com/EV3XbCSc4ae41b9dac3045f6c8a1b4972c80c0624842ba8",
    });

    test.interceptors.request.use(function(config) {
        config.url = config.baseURL + "?uri=" + config.url;
        // console.log(config)
        return config;
    }, function(error) {
        // console.log(error);
        return Promise.reject(error);
    });

    // 请求对象
    var server = {
        columns: function() {
            return test(configuration.apis.columns)
                .then(function(resp) {
                    if (resp.status !== 200) {
                        var error = new Error("请求失败 !");
                        error.detail = {
                            status:  resp.status,
                            statusText: resp.statusText,
                            config: resp.config,
                            data: resp.data,
                        };
                        throw error;
                    }
                    return resp.data;
                });
        },
    };
    // 绑定请求对象到 window
    Object.defineProperty(window, "d", {
        configurable: false,
        enumerable: false,
        writable: false,
        value: server
    });
})(window, document);

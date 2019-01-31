(function() {
    "use strict"
    // xMain 部分的状态.
    /* xMain: {
        tabNavs: Array<{ - 已经打开的 tabs
            title: string,
            url: string,
            closeable: boolean
        }>
    } */
    var xMain = d3.local();

    var render = {
        // 渲染栏目列表
        // ul: HTMLElement - 要渲染的元素
        // data: Array - 符合格式要求的数组
        columns: function(ul, data) {
            // 遍历数据, 将下级列表展开, 以便适应 d3 渲染布局
            for (var i = 0; i < data.length; i++) {
                if (data[i].hasOwnProperty("columns")) {
                    data.splice(i + 1, 0, [data[i++].columns]);
                }
            }
            // 移除当前 ul 下所有其它类型节点
            if (ul.childElementCount) {
                d3.selectAll(ul.children).filter("*:not(li)").remove();
                var li = d3.selectAll(ul.children).data(data);
            } else {
                ul = d3.select(ul).data([data]);
                var li = ul.selectAll("li").data(function(d, i, nodes) {
                    return d;
                });
            }
            // 绑定所有 li 节点
            li.exit().remove();
            li = li.merge(li.enter().append("li"));
            var span = li.attr("class", function(d, index, nodes) {
                    // 区分数组(下级列表) class 名称
                    return "nav-item " + (d instanceof Array ? "sub-item hide" : "nav-link");
                })
                .each(function(d, index, nodes) {
                    // 干掉所有其它节点
                    d3.selectAll(this.children).filter("*:not(span)").remove();
                })
                .filter(function(d, i, nodes) {
                    return !(d instanceof Array);
                })
                .on("touchstart click", function(d, i, nodes) { // 点击
                    // 不是下拉
                    if (d.url) {
                        render.tab(d.title, d.url, {
                            closeable: true
                        });
                        return;
                    }
                    // 展开列表
                    var show = !d.show;
                    // 图标
                    d3.select(this)
                        .select("span:last-child")
                        .style("transform", show ? "rotate(90deg)" : "rotate(0deg)");
                    // 得到下一个 li 节点
                    var next = this;
                    while ((next = next.nextSibling, next) && (
                            next.nodeType !== (Node.ELEMENT_NODE || 1) ||
                            !/li/i.test(next.tagName)
                        ));
                    if (!next) return;
                    d3.select(next)
                        .classed("hide", !show)
                        .classed("light", show);
                    if (show) setTimeout(function() {
                        d3.select(next)
                            .classed("light", false);
                    }, 100);

                    /*  动画暂时算了吧。
                    try { // 有动画的方式
                        var height = next.children[0].children[0].clientHeight * next.children[0].childElementCount;
                        console.log(height, next.children[0].children[0].clientHeight, next.children[0].childElementCount)
                        var elements = [next, next.children[0]];
                        console.log(elements)
                        var options = {
                            // easing: "easingCircularIn",
                            duration: 300,
                            start: function() {
                                if (show) setTimeout(function() {
                                    d3.select(next)
                                        .classed("hide", !show);
                                }, 100);
                            },
                            complete: function() {
                                if (!show) setTimeout(function() {
                                    d3.select(next)
                                        .classed("hide", !show);
                                }, 100);
                                d3.selectAll(elements)
                                    .style("height", null);
                            }
                        };
                        if (show) {
                            KUTE.allFromTo(elements, {
                                height: 0
                            }, {
                                height: height
                            }, options).start();
                        } else {
                            KUTE.allFromTo(elements, {
                                height: height
                            }, {
                                height: 0
                            }, options).start();
                        }
                    } catch (error) { // 无动画的方式
                        console.error(error)
                        d3.select(next)
                            .classed("hide", !show);
                    }
                    */

                    d.show = show;
                })
                .selectAll("span").data(function(d, index, nodes) {
                    return [d.title, d.icon || "fa fa-chevron-right"];
                });
            // 选取所有栏目节点赋值
            span.exit().remove();
            span = span.merge(span.enter().append("span"));
            span.text(function(d, index, nodes) {
                    return index ? "" : d;
                })
                .attr("class", function(d, index, nodes) {
                    return index ? d : "";
                });
            // 整理下级菜单
            var ul = li.filter(function(d, i, nodes) {
                    return d instanceof Array;
                })
                .each(function(d, i, nodes) {
                    d3.selectAll(this.children).filter("*:not(ul)").remove();
                }).selectAll("ul").data(function(d, i, nodes) {
                    return d;
                });
            ul.exit().remove();
            ul = ul.merge(ul.enter().append("ul"));
            ul.attr("class", "nav flex-column sub-nav");
            ul.each(function(d, i, nodes) {
                render.columns(this, d);
            });
        },

        // 打开一个 tab 页
        // title: string - tab 页上的标题
        // url: string - 要打开的地址
        /* options: {
            closeable: boolean - 是否可关闭
            active: boolean - 是否显示活动
        } */
        tab: function(title, url, options) {
            // 获取现在打开的页面数据
            var xMainElement = document.querySelector("#x-main");
            var tabNavs = null,
                closeable = false;
            var value = xMain.get(xMainElement);
            if (value) tabNavs = value.tabNavs;
            else {
                tabNavs = [];
                value = {};
            }
            // 是否可关闭
            if (options) closeable = options.closeable;

            // 调整 tabs 全部影藏, 最新加入的立即可见
            tabNavs.forEach(function(item, index, array) {
                if (item.active) item.active = false;
            });

            var timestamp = Date.now() + "";
            // 加入新数据
            tabNavs.push({
                title: title,
                url: url,
                closeable: closeable,
                active: true,
                id: "tab-" + timestamp.substring(timestamp.length - 8, timestamp.length)
            });


            // 更新值
            value.tabNavs = tabNavs;
            xMain.set(xMainElement, value);
            // 更新界面
            render.tabs(
                xMainElement.querySelector("#x-tab-nav"),
                xMainElement.querySelector("#x-tab-content"),
                tabNavs);
        },

        // 渲染 tabs 导航以及主体
        // nav: HTMLElement - .nav-tabs 导航
        // content: HTMLElement - .tab-content 内容部分
        // data: Array - 数据数组
        tabs: function(nav, content, data) {
            // 生成 nav-tabs 部分
            var li = d3.select(nav).selectAll("li").data(data);
            li.exit().remove();
            li = li.merge(li.enter().append("li"))
                .attr("class", "nav-item");
            var a = li.selectAll("a").data(function(d, i, nodes) {
                return [d];
            });
            a.exit().remove();
            a.merge(a.enter().append("a"))
                .attr("class", function(d, i, nodes) {
                    return "nav-link " + (d.active ? "active" : "");
                })
                .text(function(d, i, nodes) {
                    return d.title;
                })
                .attr("href", function(d, i, nodes) {
                    return "#" + d.id;
                })
                .attr("data-toggle", "tab");

            var button = li.selectAll("button").data(function(d, i, nodes) {
                return d.closeable ? [d] : [];
            });
            button.exit().remove();
            button.enter()
                .append(function(d, i, nodes) {
                    var button = document.createElement("button");
                    button.innerHTML = "<span aria-hidden=\"true\">&times;</span>";
                    button.setAttribute("type", "button");
                    button.setAttribute("class", "close");
                    return button;
                })
                // 关闭 tab 的事件
                .on("click touchstart", function(d, i, nodes) {
                    render.tab_dismiss(d.id);
                });

            // 生成 .tab-content 部分
            var iframe = d3.select(content).selectAll("iframe")
                .data(data);
            iframe.exit().remove();
            iframe.enter()
                .append("iframe")
                .merge(iframe)
                .attr("class", function(d, i, nodes) {
                    return "tab-pane fade " + (d.active ? "show active" : "");
                })
                .attr("id", function(d, i, nodes) {
                    return d.id;
                })
                .attr("src", function(d, i, nodes) {
                    if (/^http/.test(d.url))
                        return d.url;
                    else
                        return "http://" + d.url;
                });
        },

        // 关闭一个 tab 导航
        // id: string - 指定 id 的 tab
        tab_dismiss: function(id) {
            if (typeof id !== "string") return;

            // 获取现在打开的页面数据
            var xMainElement = document.querySelector("#x-main");
            var value = xMain.get(xMainElement);
            if (!value || !(value.tabNavs instanceof Array)) return;
            var tabNavs = value.tabNavs;
            for (var i = tabNavs.length - 1; i >= 0; i--) {
                if (tabNavs[i].id !== id) continue;
                // 移除数据
                tabNavs.splice(i, 1);
            }

            // 更新值
            value.tabNavs = tabNavs;
            xMain.set(xMainElement, value);
            // 更新界面
            render.tabs(
                xMainElement.querySelector("#x-tab-nav"),
                xMainElement.querySelector("#x-tab-content"),
                tabNavs);
        }
    };

    Object.defineProperty(window, "r", {
        configurable: false,
        enumerable: false,
        writable: false,
        value: render
    });
})();

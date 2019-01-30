(function() {
    "use strict"

    var render = {
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
                        render.tab(d.title, d.url);
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
        tab: function(title, url, options) {
            
            console.log(title, url)
        }
    };

    Object.defineProperty(window, "r", {
        configurable: false,
        enumerable: false,
        writable: false,
        value: render
    });
})();

// 设置 nav 的事件
var interactive = (function($, nav, expansion) {
    "use strict"
    var navWidth = $(":root").css("--nav-width");
    var $nav = $(nav);
    var $expansion = $(expansion);
    $nav.css("--nav-width", navWidth);

    var navExpansion = function(flag) {
        // 未给定参数, 自动切换
        if (typeof flag !== "boolean") {
            if ($(":root").css("--nav-width") !== "0px")
                flag = false;
        }
        if (flag) { // 展开
            $expansion.addClass("hide");
            $expansion.children().removeClass("hide");
            $(":root").css("--nav-width", navWidth);
            $nav.css("margin-left", "0px");
        } else { // 收起
            $expansion.removeClass("hide");
            $expansion.children().addClass("hide");
            $(":root").css("--nav-width", "0px");
            $nav.css("margin-left", "-" + navWidth.trim());
        }
        return false;
    };

    // 导航展开的鼠标响应
    $nav.hover(function(event) {
        expansion.setAttribute("class", "");
    }, function(event) {
        expansion.setAttribute("class", "hide");
    });
    // 收起导航面板
    $expansion.on("click touchstart", navExpansion);

    return { navExpansion };
})($, document.getElementById("x-nav"), document.getElementById("x-nav-expansion"));

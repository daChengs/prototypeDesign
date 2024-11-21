function showNotifications() {
    // 隐藏其他页面
    $('.app-page').hide();
    
    // 隐藏通用导航栏
    $('#header').hide();
    $('#nav').hide();
    
    // 加载通知页面内容
    $('#page-notifications').load('components/notifications.html', function() {
        // 显示通知页面
        $('#page-notifications').show().removeClass('leaving');
    });
    
    // 移除通知徽标
    $('.header-notification-badge').hide();
}

function hideNotifications() {
    // 添加离开动画
    $('#page-notifications').addClass('leaving');
    
    // 动画结束后执行
    setTimeout(() => {
        // 隐藏通知页面
        $('#page-notifications').hide();
        // 显示之前的页面
        $('.app-page.active').show();
        // 显示通用导航栏
        $('#header').show();
        $('#nav').show();
    }, 300);
}

function bindNotificationEvents() {
    // 视图切换
    $('.nav-tab').on('click', function() {
        const view = $(this).data('view');
        
        // 更新标签状态
        $('.nav-tab').removeClass('active');
        $(this).addClass('active');
        
        // 切换视图
        $('.view-content').removeClass('active');
        $(`.${view}-view`).addClass('active');
    });

    // 返回按钮事件
    $('.back-btn').on('click', hideNotifications);
    
    // 通知标签切换事件
    $('.notification-tabs .tab').on('click', function() {
        $('.notification-tabs .tab').removeClass('active');
        $(this).addClass('active');
        
        const tabId = $(this).data('tab');
        filterNotifications(tabId);
    });

    // 设置按钮点击事件
    $('.settings-btn').on('click', function() {
        $('.notification-settings-modal').addClass('active');
    });
    
    // 关闭弹窗事件
    $('.close-modal').on('click', function() {
        $('.notification-settings-modal').removeClass('active');
    });
    
    // 点击弹窗外部关闭
    $('.notification-settings-modal').on('click', function(e) {
        if ($(e.target).is('.notification-settings-modal')) {
            $(this).removeClass('active');
        }
    });
    
    // 保存设置变更
    $('.settings-item .switch input').on('change', function() {
        const settingType = $(this).closest('.settings-item').find('.settings-text span').text();
        const isEnabled = $(this).is(':checked');
        // 这里可以添加保存设置的逻辑
        console.log(`${settingType}: ${isEnabled}`);
    });
}

function filterNotifications(tabId) {
    const $notifications = $('.notification-item');
    
    switch(tabId) {
        case 'unread':
            $notifications.hide();
            $('.notification-item.unread').show();
            break;
        case 'mentions':
            $notifications.hide();
            $('.notification-item[data-type="mention"]').show();
            break;
        case 'system':
            $notifications.hide();
            $('.notification-item.system').show();
            break;
        default:
            $notifications.show();
    }
}

async function initializeApp() {
    try {
        // 显示开屏动画
        const splashScreen = document.getElementById('splash-screen');
        const mainContainer = document.getElementById('main-container');
        
        // 预先加载组件
        const loadComponentsPromise = loadComponents();
        
        // 开始动画
        splashScreen.querySelector('.splash-logo').classList.add('animate');
        splashScreen.querySelector('.splash-text').classList.add('animate');
        splashScreen.querySelector('.splash-loading').classList.add('animate');

        // 等待组件加载完成
        await loadComponentsPromise;
        
        // 绑定通知图标点击事件
        $('.header-notification-icon').on('click', showNotifications);
        
        // 预先渲染默认页面
        showPage('dashboard');
        
        // 绑定事件
        bindAllEvents();

        // 确保开屏动画至少显示 1.5 秒
        await new Promise(resolve => setTimeout(resolve, 1500));

        // 平滑过渡到主内容
        mainContainer.classList.add('show');
        splashScreen.style.opacity = '0';
        
        // 等待过渡动画完成后移除开屏动画
        setTimeout(() => {
            splashScreen.style.display = 'none';
        }, 500);

    } catch (error) {
        console.error('初始化失败:', error);
    }
}

function bindAllEvents() {
    // 绑定快捷操作事件
    $('.action-card').on('click', function() {
        const action = $(this).data('action');
        handleQuickAction(action);
    });

    // 绑定其他事件...
    addRippleEffect();

    // 监听滚动事件
    $('.main-content').on('scroll', function() {
        const header = $('.app-header');
        if ($(this).scrollTop() > 20) {
            header.addClass('scrolled');
        } else {
            header.removeClass('scrolled');
        }
    });

    // 初始化 AOS
    AOS.init({
        duration: 800,
        easing: 'ease-out',
        once: true
    });

    // 添加鼠标跟随效果
    document.addEventListener('mousemove', function(e) {
        const magnetic = document.querySelectorAll('.magnetic-hover');
        magnetic.forEach(element => {
            const rect = element.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width/2;
            const y = e.clientY - rect.top - rect.height/2;
            
            element.style.setProperty('--x', x * 0.1 + 'px');
            element.style.setProperty('--y', y * 0.1 + 'px');
        });
    });

    // 禁用双击缩放
    document.addEventListener('touchstart', function(event) {
        if (event.touches.length > 1) {
            event.preventDefault();
        }
    }, { passive: false });

    // 禁用双指缩放
    document.addEventListener('gesturestart', function(event) {
        event.preventDefault();
    });

    // 分类切换功能
    $('.category-item').on('click', function() {
        // 移除其他分类的激活状态
        $('.category-item').removeClass('active');
        // 添加当前分类的激活状态
        $(this).addClass('active');
        
        // 获取分类ID
        const categoryId = $(this).data('category');
        
        // 筛选课程
        filterCourses(categoryId);
    });

    // 学习页面选项卡切换
    $('.learn-tab').on('click', function() {
        const tabId = $(this).data('tab');
        
        // 更新选项卡状态
        $('.learn-tab').removeClass('active');
        $(this).addClass('active');
        
        // 更新内容显示
        $('.tab-pane').removeClass('active').hide();
        $(`#${tabId}`).addClass('active').fadeIn(300);
        
        // 如果切换到课程标签或推荐标签，重置分类选择并显示所有课程
        if (tabId === 'courses' || tabId === 'recommended') {
            // 移除所有分类的激活状态
            $('.category-item').removeClass('active');
            // 激活"全部"分类
            $('.category-item[data-category="all"]').addClass('active');
            // 显示所有课程
            $('.course-card').show().css('opacity', '0').each(function(index) {
                $(this).delay(index * 100).animate({opacity: 1}, 300);
            });
        }
        
        // 添加过渡动画
        $(`#${tabId}`).css('opacity', '0')
            .addClass('animate__animated animate__fadeIn')
            .css('opacity', '1');
        
        // 移除动画类，以便下次切换
        setTimeout(() => {
            $(`#${tabId}`).removeClass('animate__animated animate__fadeIn');
        }, 1000);

        // 滚动到顶部
        $('.main-content').scrollTop(0);
    });

    // 添加通知页面路由
    function showNotifications() {
        // 隐藏其他页面
        $('.app-page').hide();
        
        // 隐藏通用导航栏
        $('#header').hide();
        $('#nav').hide();
        
        // 加载通知页面内容
        $('#page-notifications').load('components/notifications.html', function() {
            // 显示通知页面
            $('#page-notifications').show().removeClass('leaving');
        });
        
        // 移除通知徽标
        $('.header-notification-badge').hide();
    }

    // 隐藏通知页面
    function hideNotifications() {
        // 添加离开动画
        $('#page-notifications').addClass('leaving');
        
        // 动画结束后执行
        setTimeout(() => {
            // 隐藏通知页面
            $('#page-notifications').hide();
            // 显示之前的页面
            $('.app-page.active').show();
            // 显示通用导航栏
            $('#header').show();
            $('#nav').show();
        }, 300);
    }

    // 筛选通知
    function filterNotifications(tabId) {
        const $notifications = $('.notification-item');
        
        switch(tabId) {
            case 'unread':
                $notifications.hide();
                $('.notification-item.unread').show();
                break;
            case 'mentions':
                $notifications.hide();
                $('.notification-item[data-type="mention"]').show();
                break;
            case 'system':
                $notifications.hide();
                $('.notification-item.system').show();
                break;
            default:
                $notifications.show();
        }
    }

    // 绑定通知图标点击事件
    $('.header-notification-icon').on('click', function() {
        showNotifications();
    });

    // 绑定通知标签切换事件
    $('.notification-tabs .tab').on('click', function() {
        $('.notification-tabs .tab').removeClass('active');
        $(this).addClass('active');
        
        const tabId = $(this).data('tab');
        // 这里可以添加过滤通知的逻辑
    });

    // 绑定全部已读按钮事件
    $('.mark-all-read').on('click', function() {
        $('.unread-indicator').fadeOut();
        $('.notification-item.unread').removeClass('unread');
    });

    // 绑定视图切换事件
    function bindNotificationEvents() {
        // 视图切换
        $('.nav-tab').on('click', function() {
            const view = $(this).data('view');
            
            // 更新标签状态
            $('.nav-tab').removeClass('active');
            $(this).addClass('active');
            
            // 切换视图
            $('.view-content').removeClass('active');
            $(`.${view}-view`).addClass('active');
        });

        // 返回按钮事件
        $('.back-btn').on('click', hideNotifications);
        
        // 通知标签切换事件
        $('.notification-tabs .tab').on('click', function() {
            $('.notification-tabs .tab').removeClass('active');
            $(this).addClass('active');
            
            const tabId = $(this).data('tab');
            filterNotifications(tabId);
        });
    }
}

function filterCourses(categoryId) {
    // 获取当前激活的标签页
    const activeTab = $('.learn-tab.active').data('tab');
    // 获取对应的课程容器
    const courseContainer = activeTab === 'recommended' ? '#recommended .course-grid' : '#courses .course-grid';
    
    if (categoryId === 'all') {
        // 显示所有课程
        $(`${courseContainer} .course-card`).show().css('opacity', '0').each(function(index) {
            $(this).delay(index * 100).animate({opacity: 1}, 300);
        });
    } else {
        // 隐藏所有课程
        $(`${courseContainer} .course-card`).hide();
        // 显示对应分类的课程
        $(`${courseContainer} .course-card[data-category="${categoryId}"]`).show().css('opacity', '0').each(function(index) {
            $(this).delay(index * 100).animate({opacity: 1}, 300);
        });
    }
}

function handleQuickAction(action) {
    switch(action) {
        case 'mock-interview':
            showToast('正在准备模拟面试...');
            break;
        case 'resume':
            showToast('打开简历管理...');
            break;
        case 'personality':
            showToast('开始性格测评...');
            break;
        case 'interview-calendar':
            showToast('查看面试日程...');
            break;
    }
}

function showToast(message) {
    const toast = $('<div>', {
        class: 'toast',
        text: message
    });
    
    $('body').append(toast);
    setTimeout(() => {
        toast.remove();
    }, 2000);
}

function addRippleEffect() {
    const elements = document.querySelectorAll('.nav-item, .dashboard-action-card, .learn-tab, .practice-item');
    elements.forEach(element => {
        element.addEventListener('click', function(e) {
            const ripple = document.createElement('div');
            ripple.className = 'ripple';
            
            const rect = element.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = e.clientX - rect.left - size/2 + 'px';
            ripple.style.top = e.clientY - rect.top - size/2 + 'px';
            
            element.appendChild(ripple);
            
            ripple.addEventListener('animationend', () => {
                ripple.remove();
            });
        });
    });
}

function goBack() {
    // 添加离开动画
    $('#page-notifications').addClass('leaving');
    
    // 动画结束后隐藏页面
    setTimeout(() => {
        $('#page-notifications').hide();
        // 显示通用导航栏
        $('#header').show();
        $('#nav').show();
    }, 300);
    
    // 更新历史记录
    window.history.back();
}

$(document).ready(function() {
    // 通知图标点击事件
    $('.header-notification-icon').on('click', showNotifications);
    
    // 返回按钮点击事件
    $('.notifications-nav .back-btn').on('click', goBack);
    
    // 处理浏览器返回按钮
    window.addEventListener('popstate', function(event) {
        if (event.state && event.state.page === 'notifications') {
            showNotifications();
        } else {
            $('#page-notifications').hide();
            $('#header').show();
            $('#nav').show();
        }
    });
});

$(document).ready(function() {
    try {
        initializeApp();
    } catch (error) {
        console.error('初始化失败:', error);
    }
});

// 添加波纹效果函数
function createRipple(event, element) {
    // 移除已有的波纹
    const ripples = element.getElementsByClassName('ripple');
    Array.from(ripples).forEach(ripple => ripple.remove());

    // 创建新的波纹元素
    const ripple = document.createElement('div');
    ripple.className = 'ripple';
    
    // 计算波纹大小
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    
    // 设置波纹样式
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${event.clientX - rect.left - size/2}px`;
    ripple.style.top = `${event.clientY - rect.top - size/2}px`;
    
    // 添加波纹到元素中
    element.appendChild(ripple);
    
    // 动画结束后移除波纹
    ripple.addEventListener('animationend', () => {
        ripple.remove();
    });
}

// 绑定导航事件
function bindNavEvents() {
    $('.nav-item').on('click', function(e) {
        const pageId = $(this).data('page');
        showPage(pageId);
        
        // 创建波纹效果
        createRipple(e, this);
    });
}

// 加载组件函数
function loadComponents() {
    return new Promise((resolve, reject) => {
        let loadedCount = 0;
        const totalComponents = 7;

        function checkAllLoaded() {
            loadedCount++;
            if (loadedCount === totalComponents) {
                resolve();
            }
        }

        // 加载头部导航
        $('#header').load('components/header.html', function(response, status, xhr) {
            if (status === 'error') {
                console.error('加载头部导航失败:', xhr.status, xhr.statusText);
                reject(new Error('加载头部导航失败'));
            }
            checkAllLoaded();
        });

        // 加载底部导航
        $('#nav').load('components/nav.html', function(response, status, xhr) {
            if (status === 'error') {
                console.error('加载底部导航失败:', xhr.status, xhr.statusText);
                reject(new Error('加载底部导航失败'));
            } else {
                // 加载完成后立即绑定导航事件
                bindNavEvents();
            }
            checkAllLoaded();
        });

        // 加载各个页面内容
        const pages = ['dashboard', 'learn', 'practice', 'community', 'profile'];
        pages.forEach(page => {
            $(`#page-${page}`).load(`components/${page}.html`, function(response, status, xhr) {
                if (status === 'error') {
                    console.error(`加载${page}页面失败:`, xhr.status, xhr.statusText);
                    reject(new Error(`加载${page}页面失败`));
                }
                checkAllLoaded();
            });
        });
    });
}

// 页面切换函数
function showPage(pageId) {
    // 先移除所有页面的显示
    $('.app-page').css('display', 'none').removeClass('active');
    
    // 显示目标页面
    $(`#page-${pageId}`).css('display', 'block').addClass('active');
    
    // 更新导航状态
    $('.nav-item').removeClass('active');
    $(`.nav-item[data-page="${pageId}"]`).addClass('active');
    
    // 如果切换到学习页面，确保推荐标签页是激活状态
    if (pageId === 'learn') {
        // 激活推荐标签
        $('.learn-tab').removeClass('active');
        $('.learn-tab[data-tab="recommended"]').addClass('active');
        
        // 显示推荐内容
        $('.tab-pane').removeClass('active').hide();
        $('#recommended').addClass('active').show();
        
        // 确保分类选中"全部"
        $('.category-item').removeClass('active');
        $('.category-item[data-category="all"]').addClass('active');
    }
    
    // 滚动到顶部
    $('.main-content').scrollTop(0);
}

// 显示系统设置页面
function showSettings() {
    // 隐藏其他页面
    $('.app-page').hide();
    
    // 隐藏通用导航栏
    $('#header').hide();
    $('#nav').hide();
    
    // 加载设置页面内容
    $('#page-settings').load('components/settings.html', function() {
        // 显示设置页面
        $('#page-settings').show().removeClass('leaving');
    });
}

// 隐藏设置页面
function hideSettings() {
    // 添加离开动画
    $('#page-settings').addClass('leaving');
    
    // 动画结束后执行
    setTimeout(() => {
        // 隐藏设置页面
        $('#page-settings').hide();
        // 显示之前的页面
        $('.app-page.active').show();
        // 显示通用导航栏
        $('#header').show();
        $('#nav').show();
    }, 300);
}
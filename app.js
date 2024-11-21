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
            }
            checkAllLoaded();
        });

        // 加载底部导航
        $('#nav').load('components/nav.html', function(response, status, xhr) {
            if (status === 'error') {
                console.error('加载底部导航失败:', xhr.status, xhr.statusText);
            } else {
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
                }
                // 初始隐藏非首页内容
                if (page !== 'dashboard') {
                    $(this).css('display', 'none');
                }
                checkAllLoaded();
            });
        });
    });
}

// 绑定导航事件
function bindNavEvents() {
    $('.nav-item').on('click', function(e) {
        // 页面切换
        const pageId = $(this).data('page');
        showPage(pageId);
        
        // 创建波纹效果
        createRipple(e, this);
    });
}

// 创建波纹效果
function createRipple(event, element) {
    const ripple = document.createElement('div');
    ripple.className = 'ripple';
    
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = event.clientX - rect.left - size/2 + 'px';
    ripple.style.top = event.clientY - rect.top - size/2 + 'px';
    
    element.appendChild(ripple);
    
    // 监听动画结束后删除 ripple 元素
    ripple.addEventListener('animationend', () => {
        ripple.remove();
    });
}

// 修改初始化函数
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

// 绑定所有事件
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
}

// 修改课程筛选函数
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

// 快捷操作处理函数
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

// Toast 提示函数
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

// 添加波纹效果
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

// 在 DOM 加载完成后初始化应用
$(document).ready(function() {
    try {
        initializeApp();
    } catch (error) {
        console.error('初始化失败:', error);
    }
});
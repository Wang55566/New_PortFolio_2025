const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

if (GA_MEASUREMENT_ID) {
    window.dataLayer = window.dataLayer || [];
    if (!window.gtag) {
        window.gtag = function(){ window.dataLayer.push(arguments); };
    }

    // 動態載入 GA script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;

    // script 載入完成後初始化 GA
    script.onload = () => {
        try {
            window.gtag('js', new Date());
            window.gtag('config', GA_MEASUREMENT_ID, {
                page_path: window.location.pathname
            });
        } catch (error) {
            console.error('Google Analytics initialization error:', error);
        }
    };

    // 錯誤處理
    script.onerror = () => {
        console.error('Failed to load Google Analytics script');
    };

    document.head.appendChild(script);
}
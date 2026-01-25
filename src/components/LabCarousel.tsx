export const LabCarousel = () => {
    return (
        <section className="py-20 relative overflow-hidden" id="lab">
            <div className="px-4 md:px-20 mb-10 flex items-center justify-between">
                <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">The <span className="text-primary italic">Lab</span></h2>
                <div className="flex gap-2">
                    <button className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <button className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors">
                        <span className="material-symbols-outlined">arrow_forward</span>
                    </button>
                </div>
            </div>
            <div className="flex overflow-x-auto gap-6 px-4 md:px-20 pb-10 no-scrollbar snap-x snap-mandatory">
                {/* Carousel Item 1 */}
                <div className="snap-center shrink-0 w-[85vw] md:w-[400px] h-[500px] glass-panel rounded-[3rem] p-4 flex flex-col relative group">
                    <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="material-symbols-outlined text-primary">arrow_outward</span>
                    </div>
                    <div className="flex-1 bg-cover bg-center rounded-[2.5rem] mb-4 opacity-80 group-hover:opacity-100 transition-opacity" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCqg-n8iwcL2_CFWc8ywP9YdicUazK4U0nUEgZvolqlqcxJBXQohWaUQY5Xu7NX3tBpawuz7djjrhBPkectIHDHnv849inlb5Jh6ZfDXg1SXTd0n49xBIcKFMXZgHVVSbf9M0GiX79FiIYkQeDrujEVkVfZbvc4BBF4Vel4Yieq7dIsjpw5sNNTGUVgyrG4oUucorZGUi_BjStrgYte1XJd79ligd6E8qrDREDov2auHAEhCl8EG7ky4ZCWMx55IeA8dPzA4TvY1O8')" }}></div>
                    <div className="px-2 pb-2">
                        <h4 className="text-xl font-bold text-white">Project Alpha</h4>
                        <p className="text-sm text-white/50">WebGL Experiment</p>
                    </div>
                </div>
                {/* Carousel Item 2 */}
                <div className="snap-center shrink-0 w-[85vw] md:w-[400px] h-[500px] glass-panel rounded-[3rem] p-4 flex flex-col relative group">
                    <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="material-symbols-outlined text-primary">arrow_outward</span>
                    </div>
                    <div className="flex-1 bg-cover bg-center rounded-[2.5rem] mb-4 opacity-80 group-hover:opacity-100 transition-opacity" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAxecAMpLHfHwHqQutioJeZ27Xtd84gU89Yyahbdp-H6Z0r5iXRTc3sTEqcgsGAgx6jMszuGqqR7-T7EgO-U2zOiU7H4Z1bbxiaD0LSP0RKRRKZEgy_3vlpmJzU1R7NPZw7jRzPhnn3yeRQnx0CmhQa3-yvDgGQHrlyHyi5ZpTSG1dOj8rIU8js8wKG88ujm_DFSmWvIQ1uoXFn5jMbXsVLh8JJIDY6qjENGFydQ6Hk0_YrPw2ImM6Wb6rSQQdczTJ6UM7I5GgP1KI')" }}></div>
                    <div className="px-2 pb-2">
                        <h4 className="text-xl font-bold text-white">Project Beta</h4>
                        <p className="text-sm text-white/50">Creative Coding</p>
                    </div>
                </div>
                {/* Carousel Item 3 */}
                <div className="snap-center shrink-0 w-[85vw] md:w-[400px] h-[500px] glass-panel rounded-[3rem] p-4 flex flex-col relative group">
                    <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="material-symbols-outlined text-primary">arrow_outward</span>
                    </div>
                    <div className="flex-1 bg-cover bg-center rounded-[2.5rem] mb-4 opacity-80 group-hover:opacity-100 transition-opacity" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDNFQrLIaDZMWp4dd4EjA98hmdNge03stokRt4Bf3lIrgprLAUN2__mAfZJg_v6u0kIW1pTRvE_GWn0lEWhtZBG9Wz1jsCBAJwJYjbxng_aAxrwIH7AQnxCHUV5Y4_qd5v-pdZhT6QMA6QuP6kTAlwfNAGyoKPyVxWXHejNiA20k1EmmeOP03rHgLuzueXWWL2NMTIzNwefGetvn1l8Bi0Cyu0W1WwrJv3RV6XDpSu8FZw_aUmsQ2kxH1frOsu-4uA1jHtz0KZ7QTQ')" }}></div>
                    <div className="px-2 pb-2">
                        <h4 className="text-xl font-bold text-white">Project Gamma</h4>
                        <p className="text-sm text-white/50">Interactive Design</p>
                    </div>
                </div>
                {/* Carousel Item 4 */}
                <div className="snap-center shrink-0 w-[85vw] md:w-[400px] h-[500px] glass-panel rounded-[3rem] p-4 flex flex-col items-center justify-center relative group hover:bg-white/10 transition-colors cursor-pointer text-white">
                    <div className="p-6 rounded-full border border-dashed border-white/30 mb-4 group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-4xl">add</span>
                    </div>
                    <p className="font-bold">View Archive</p>
                </div>
            </div>
        </section>
    );
};

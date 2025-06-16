const Footer = () => {
    return (
        <footer className="fixed bottom-0 left-0 w-full z-50 bg-white dark:bg-[#1F2937] shadow-md py-1">
            <div className="max-w-screen-xl mx-auto px-2 text-xs sm:text-sm text-center text-gray-600 dark:text-gray-300">
                © {new Date().getFullYear()} Little Money Technologies Pvt. Ltd. All rights reserved.
            </div>
        </footer>

    );
};

export default Footer;

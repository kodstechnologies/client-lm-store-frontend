const Footer = () => {
    return (
        <footer className="w-full fixed bottom-0 left-0 z-50 bg-white dark:bg-[#1F2937] shadow-sm">
            <div className="max-w-screen-xl mx-auto px-4 py-3 sm:flex sm:items-center sm:justify-between text-sm text-center sm:text-left dark:text-white-dark text-gray-600 dark:text-gray-300">
                <p>
                    © {new Date().getFullYear()} Little Money Technologies Pvt. Ltd. All rights reserved.
                </p>
            </div>
        </footer>
    );
};

export default Footer;

import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-gray-100 dark:bg-gray-800 border-t">
      <div className="container mx-auto py-8 px-4">
        {/*<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#"
                  className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#"
                  className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400"
                >
                  Careers
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#"
                  className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400"
                >
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Connect</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#"
                  className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400"
                >
                  Twitter
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400"
                >
                  LinkedIn
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400"
                >
                  GitHub
                </Link>
              </li>
            </ul>
          </div>
        </div> */}
        <div className="">
          <p className="text-center text-gray-500 dark:text-gray-400">&copy; 2024 LED-UP. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

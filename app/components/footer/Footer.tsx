export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-10 mt-12">
      <div className="container mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left side - Store description */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">MyStore</h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            MyStore is your one-stop destination for quality products at
            unbeatable prices. We’re committed to bringing you the best shopping
            experience with fast delivery and reliable customer support.
          </p>
          <p className="text-gray-500 text-xs mt-4">
            © {new Date().getFullYear()} MyStore. All rights reserved.
          </p>
        </div>

        {/* Right side - Random links */}
        <div className="flex flex-col md:items-end space-y-2">
          <a href="#" className="hover:text-white transition">
            About Us
          </a>
          <a href="#" className="hover:text-white transition">
            Contact
          </a>
          <a href="#" className="hover:text-white transition">
            Privacy Policy
          </a>
          <a href="#" className="hover:text-white transition">
            Terms & Conditions
          </a>
          <a href="#" className="hover:text-white transition">
            FAQ
          </a>
        </div>
      </div>
    </footer>
  );
}

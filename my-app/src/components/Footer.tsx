import React from "react";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-12 mt-20 border-t border-slate-600/50">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          {/* Brand Section */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img
                src="/logo.png"
                alt="DevBlog Logo"
                className="w-12 h-12 rounded-full shadow-lg border-2 border-blue-500/30 hover:border-blue-400/50 transition-all duration-300"
              />
              <div className="absolute -inset-1 bg-blue-500/20 rounded-full blur opacity-50"></div>
            </div>
            <div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                DevBlog
              </h3>
              <p className="text-sm text-slate-400 font-medium">Sharing Programming Knowledge</p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex space-x-8">
     <p className="text-sm text-slate-400">
              © 2025 DevBlog. All rights reserved.
            </p>
          </div>

          {/* Contact Info */}
          <div className="text-center md:text-right">
            <p className="text-sm text-slate-400 mb-2">Get in touch</p>
            <a
              href="mailto:ble07983@gmail.com"
              className="text-slate-300 hover:text-blue-400 transition-colors duration-200 text-sm font-medium hover:underline"
            >
              ble07983@gmail.com
            </a>
          </div>
        </div>
        
        {/* Bottom Section */}
      
      </div>
    </footer>
  )
}

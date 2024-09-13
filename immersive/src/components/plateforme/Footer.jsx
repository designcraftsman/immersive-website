import React from 'react';
import logo from '../../assets/plateforme/logo.png';
import { Facebook, Instagram, Linkedin, Youtube, Pinterest, Tiktok } from 'react-bootstrap-icons'; // Import specific icons
import { Link, useNavigate } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-sections container  ">
        <div className="footer-column ps-5"> 
          <h4 className='mb-3 p-0'>Immerse</h4>
          <ul>
          <li><Link to="/about" className="text-decoration-none ">About</Link></li>
          <li><Link to="/contact" className="text-decoration-none ">Contact</Link></li>
          </ul>
        </div>
        <div className="footer-column">
          <h4 className='mb-3 p-0'>Community</h4>
          <ul>
          <li><Link to="/privacy" className="text-decoration-none ">Privacy</Link></li>
          <li><Link to="/terms" className="text-decoration-none ">Terms</Link></li>
          </ul>
        </div>
        <div className="footer-column">
          <h4 className='mb-3 p-0'>More</h4>
          <ul>
            <li><Link to=".#faq" className="text-decoration-none">FAQ</Link></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom container">
        <div className="footer-logo">
          <img src={logo} alt="Immerse Logo" />
        </div>
        <p>© Immerse, Inc. 2024</p>
        <div className="social-media">
          <a href="#" aria-label="Facebook"><Facebook className="bi" /></a>
          <a href="#" aria-label="Instagram"><Instagram className="bi" /></a>
          <a href="#" aria-label="LinkedIn"><Linkedin className="bi" /></a>
          <a href="#" aria-label="YouTube"><Youtube className="bi" /></a>
          <a href="#" aria-label="Pinterest"><Pinterest className="bi" /></a>
          <a href="#" aria-label="TikTok"><Tiktok className="bi" /></a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

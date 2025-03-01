import React from 'react'
import { assets } from '../../assets/assets'
import './Footer.css'

const Footer = () => {
    return (
        <div className='footer' id='footer'>
            <div className="footer-content">
                <div className="footer-content-left">
                    <img className='logo' src="https://yt3.ggpht.com/-VMlDBPP33Yw/AAAAAAAAAAI/AAAAAAAAAAA/N8i9Hxk-Ljs/s900-c-k-no-mo-rj-c0xffffff/photo.jpg" alt="" />
                    <p>Food Fusion is a combination of wide variety of food items in a single site. This site is implemented in such a way that the needs of the user is being fulfilled by placing the order without any challenges. This food fusion was implemented in the year 2024.</p>
                    <div className="footer-social-icons">
                        <img src={assets.facebook_icon} alt="" />
                        <img src={assets.twitter_icon} alt="" />
                        <img src={assets.linkedin_icon} alt="" />
                    </div>
                </div>
                <div className="footer-content-center">
                    <h2>COMPANY</h2>
                    <ul>
                        <li>Home</li>
                        <li>About us</li>
                        <li>Delivery</li>
                        <li>Privacy policy</li>
                    </ul>
                </div>
                <div className="footer-content-right">
                    <h2>GET IN TOUCH</h2>
                    <ul>
                        <li>+91-99850-92359</li>
                        <li>amarnadhchow@gmail.com</li>
                    </ul>

                </div>
            </div>
            <hr />
            <p className="footer-copyright">Copyright 2024 ©️ Foodfusion.com - All Right Reserved</p>
        </div>
    )
}

export default Footer

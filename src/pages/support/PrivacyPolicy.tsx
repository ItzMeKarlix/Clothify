import React from 'react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="bg-white border border-gray-100 p-8">
      <img
        src="https://images.pexels.com/photos/327540/pexels-photo-327540.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
        alt="Privacy Policy"
        className="w-full h-48 object-cover mb-6"
      />
      <h1 className="text-3xl font-light text-black mb-6 tracking-wide">Privacy Policy</h1>
      <div className="space-y-4 text-gray-700 font-light">
        <p>
          At Clothify, accessible from clothify.com, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by Clothify and how we use it.
        </p>
        <p>
          If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact us.
        </p>
        <h2 className="font-semibold text-black mt-4 mb-2">Log Files</h2>
        <p>
          Clothify follows a standard procedure of using log files. These files log visitors when they visit websites. All hosting companies do this and a part of hosting services' analytics. The information collected by log files include internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks. These are not linked to any information that is personally identifiable. The purpose of the information is for analyzing trends, administering the site, tracking users' movement on the website, and gathering demographic information.
        </p>
        <h2 className="font-semibold text-black mt-4 mb-2">Cookies and Web Beacons</h2>
        <p>
          Like any other website, Clothify uses 'cookies'. These cookies are used to store information including visitors' preferences, and the pages on the website that the visitor accessed or visited. The information is used to optimize the users' experience by customizing our web page content based on visitors' browser type and/or other information.
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;

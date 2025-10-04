import { CheckCircleIcon } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import '../styles/gradients.css'

export const PricingPage = () => {

  const [isDarkMode, setIsDarkMode] = useState(false);
    
    useEffect(() => {
      const checkDarkMode = () => {
        setIsDarkMode(document.documentElement.classList.contains('dark'));
      };
      
      // Check initially
      checkDarkMode();
      
      // Watch for class changes
      const observer = new MutationObserver(checkDarkMode);
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class']
      });
      
      return () => observer.disconnect();
    }, []); 

      const handleConnectDrive = (): void => {
    // window.location.href = "http://localhost:3000/auth/google";
    window.location.href = "https://better-drive-tau.vercel.app/vip-list"
  };

  const pricingPlans = [
    {
      id: "free-trial",
      title: "Free for 14 Days",
      subtitle: "Two week to fall in love with.",
      features: [
        "Full access to all BetterDrive features",
        "Complete improved UI/UX experience",
        "No credit card required",
        "Access to all customization options",
      ],
      buttonText: "Start Free Trial",
      buttonColor:
        "bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700",
    },
    {
      id: "pro-plan",
      title: "BetterDrive Pro",
      subtitle: "pause or cancel anytime • $4.99/mo.",
      features: [
        "All core BetterDrive UI improvements",
        "Clean, intuitive Google Drive interface",
        "Custom themes and views",
        "Priority support response",
        "All future updates included",
      ],
      buttonText: "Subscribe Now",
      buttonColor:
        "bg-green-500 dark:bg-green-600 hover:bg-green-600 dark:hover:bg-green-700",
    },
  ];

  return (
    <div id="pricing"
      className={`h-fit w-full flex flex-col items-center justify-start pt-[14svh] pb-[8svh] ${isDarkMode ? 'pricingPageGradient-dark' : 'bg-[#FFFEFE]'} `}
    >
      <h1 className={`text-[2.5rem] pr-1 dark:text-gray-100 text-neutral-900 font-antique-olive`}>Pricing</h1>
      <hr className="mt-[1vh] mb-[1.5vh] h-[2px] dark:h-[1px] w-[7vw] bg-neutral-900 dark:bg-gray-600" />

      <div className="flex flex-col md:flex-row items-center justify-center gap-6 px-4 py-8 w-full">
        {pricingPlans.map((plan) => (
          <div
            key={plan.id}
            className="w-[85vw] sm:w-[50vw] md:w-[37vw] lg:w-[30vw] xl:w-[23vw] min-h-[60svh] md:h-[65svh] bg-[#FCFCFC] hover:bg-[#F5F5F5] dark:bg-neutral-900/90 dark:hover:bg-[#202124] border border-neutral-300 dark:border-gray-800 rounded-2xl p-6 pt-9 flex flex-col justify-between shadow-md hover:shadow-lg"
          >
            <div>
              <h2 className="font-antique-olive text-[1.9rem] sm:text-3xl text-neutral-900 dark:text-white mb-3">
                {plan.title}
              </h2>
              {plan.subtitle && (
                <p className="font-fkGrotesk text-neutral-500 dark:text-neutral-400 text-md sm:text-sm mb-6">
                  {plan.subtitle}
                </p>
              )}
              <ul className="font-fkGrotesk text-neutral-900 dark:text-white space-y-[13px] mb-6 text-base">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircleIcon
                      size={20}
                      weight="fill"
                      className="text-green-400 mt-0.5 flex-shrink-0"
                    />
                    <span className="font-light dark:font-thin text-[1rem] sm:text-[0.95rem]">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="sm:h-24 mb-4">
              <button
                onClick={handleConnectDrive} className={`w-full ${plan.buttonColor} text-white font-semibold py-3 px-8 rounded-lg transition-colors mb-5`}
              >
                {plan.buttonText}
              </button>
              <p className="font-fkGrotesk text-[0.78rem] sm:text-xs text-neutral-500 dark:text-neutral-400 text-left">
                Questions?{" "}
                <span className="pl-[1px] text-green-600 dark:text-green-700 font-semibold hover:underline cursor-pointer">
                  <a href="mailto:contact@betterdrive.com">Chat with us</a>
                </span>
                <br />
                <span className="mt-1 sm:mt-2 block">
                  or email at{" "}
                  <a
                    href="mailto:contact@betterdrive.com"
                    className="pl-[2px] text-green-600 dark:text-green-700 font-semibold hover:underline"
                  >
                    contact@betterdrive.com
                  </a>
                </span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

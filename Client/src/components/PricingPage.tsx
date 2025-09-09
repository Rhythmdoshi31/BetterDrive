import { CheckCircleIcon } from "@phosphor-icons/react";

export const PricingPage = () => {
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
    <div
      className="h-[100vh] w-full flex flex-col items-center justify-start pt-[14vh] pb-[4vh]"
      style={{
        background:
          "linear-gradient(225deg, rgba(0,0,0,0.5) 0%, rgba(8, 8, 28, 0.5) 50%, rgba(3, 12, 37, 0.5) 100%), linear-gradient(135deg, rgba(0,0,0,0.5) 0%, rgba(13, 13, 68, 0.5) 50%, rgba(3, 12, 37, 0.5) 100%)",
      }}
    >
      <h1 className="text-4xl pr-1 text-white font-antique-olive">Pricing</h1>
      <hr className="mt-[2vh] mb-[0.5vh] h-[2px] dark:h-[1px] w-[7vw] bg-neutral-900/50 dark:bg-gray-500" />

      <div className="flex justify-center gap-6 px-4 py-8 w-full">
        {pricingPlans.map((plan) => (
          <div
            key={plan.id}
            className="w-[23vw] h-[65vh] bg-neutral-900/90 hover:bg-[#202124] border border-gray-800 rounded-2xl p-6 pt-9 flex flex-col justify-between"
          >
            <div>
              <h2 className="font-antique-olive text-3xl text-white mb-3">
                {plan.title}
              </h2>
              {plan.subtitle && (
                <p className="font-fkGrotesk text-neutral-400 text-sm mb-6">
                  {plan.subtitle}
                </p>
              )}
              <ul className="font-fkGrotesk text-white space-y-[13px] mb-6 text-base">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircleIcon
                      size={20}
                      weight="light"
                      className="text-green-400 mt-0.5 flex-shrink-0"
                    />
                    <span className="font-thin text-[0.95rem]">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="h-24 mb-4">
              <button
                className={`w-full ${plan.buttonColor} text-white font-semibold py-3 px-6 rounded-lg transition-colors mb-5`}
              >
                {plan.buttonText}
              </button>
              <p className="font-fkGrotesk text-xs text-neutral-400 text-left">
                Questions?{" "}
                <span className="pl-[1px] text-green-700 font-semibold hover:underline cursor-pointer">
                  Chat with us
                </span>
                <br />
                <span className="mt-2 block">
                  or email at{" "}
                  <a
                    href="mailto:contact@betterdrive.com"
                    className="pl-[2px] text-green-700 font-semibold hover:underline"
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

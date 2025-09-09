import { InfiniteMovingCards } from "./ui/infinite-moving-cards";

export function ReviewsPage() {
  return (
    <div
      className="h-[100vh] w-full flex flex-col items-center justify-start pt-[18vh]"
      style={{
        background:
          "linear-gradient(225deg, rgba(0,0,0,0.5) 0%, rgba(8, 8, 28, 0.5) 50%, rgba(3, 12, 37, 0.5) 100%), linear-gradient(135deg, rgba(0,0,0,0.5) 0%, rgba(13, 13, 68, 0.5) 50%, rgba(3, 12, 37, 0.5) 100%)",
      }}
    >
      <h1 className="text-gray-100 text-[2rem] font-antique-olive tracking-wide text-center">Most people barely use 30% of their Google Drive <br /> Because it's too hard to organize</h1>
      <hr className="mt-[3vh] mb-[1.5vh] h-[2px] dark:h-[1px] w-[20vw] bg-neutral-900/50 dark:bg-gray-500" />
      <h6 className="text-gray-500 text-[0.95rem] mt-[2vh]">Google Drive's confusing interface leaves terabytes of storage unused</h6>
      <div className="h-[27rem] rounded-md flex flex-col antialiased items-center justify-center relative overflow-hidden">
        <InfiniteMovingCards
          items={testimonials}
          direction="right"
          speed="slow"
        />
      </div>
    </div>
  );
}

const testimonials = [
  {
    quote:
      "Google Drive white screen always hurt my eyes. I can't work long time because it's so bright. Many times I just give up and don't upload my files. But BetterDrive is so much better! Dark mode very nice and I can organize my photos and work files properly now. My storage is finally being used!",
    name: "Priya Thakur",
    title: "Software Developer",
  },
  {
    quote:
      "I am student and have 2TB storage from university but only use maybe 300GB because Google Drive very confusing for me. Files everywhere, can't find anything, so messy! Always losing my assignment and project files. Very frustrating when deadline coming. Now BetterDrive is much more easy to use and I can find my things. Storage almost full now because I actually use it proper!",
    name: "Priyanshu Singh", 
    title: "Engineering Student",
  },
  {
    quote:
      "Finally! A Drive that doesn't make me want to throw my laptop out the window. The interface is clean, modern, and actually makes sense. I love how easy it is to organize projects and the mobile app is amazing too.",
    name: "Bharti Kashyap",
    title: "Marketing Coordinator",
  },
  {
    quote:
      "As a freelancer, I'm constantly switching between devices and sharing files with clients. Google Drive's interface was slowing me down every single day. BetterDrive feels like what Google Drive should have been from day one - intuitive, fast, and professional-looking.",
    name: "Prashant Shinde",
    title: "Freelance Web Designer", 
  },
];

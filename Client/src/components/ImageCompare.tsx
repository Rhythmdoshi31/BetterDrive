import { Compare } from "./ui/compare";
 
interface ImageCompareProps {
  id: string;
}

export default function ImageCompare({id} : ImageCompareProps) {
  return (
    <div id={id} className="p-4 border rounded-3xl dark:bg-neutral-900 bg-neutral-100  border-neutral-200 dark:border-neutral-800 px-4">
      <Compare
        firstImage="https://assets.aceternity.com/code-problem.png"
        secondImage="https://assets.aceternity.com/code-solution.png"
        firstImageClassName="object-cover object-left-top"
        secondImageClassname="object-cover object-left-top"
        className="h-[55vh] w-[75vw] sm:h-[50vh] sm:w-[70vw] md:h-[55vh] md:w-[60vw]  lg:h-[55vh] lg:w-[55vw]"
        slideMode="hover"
      />
    </div>
  );
}
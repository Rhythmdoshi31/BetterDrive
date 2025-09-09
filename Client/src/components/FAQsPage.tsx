import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

export const FAQsPage = () => {
  return (
    <div
      className="h-[110vh] w-full flex flex-col items-center justify-start pt-[17vh]"
      style={{
        background:
          "linear-gradient(290deg, rgba(3, 12, 37, 0.5) 0%, rgba(8, 8, 28, 0.5) 50%, rgba(0, 0, 0, 0.5) 100%), linear-gradient(70deg, rgba(0, 0, 0, 0.5) 0%, rgba(13, 13, 68, 0.5) 50%, rgba(3, 12, 37, 0.5) 100%)",
      }}
    >
        <h1 className="text-4xl pr-1 text-white font-antique-olive">Frequently Asked Questions -</h1>
      <hr className="mt-[2vh] mb-[13vh] h-[2px] dark:h-[1px] w-[7vw] bg-neutral-900/50 dark:bg-gray-600" />

      <Accordion className="scale-[1.3]" type="single" collapsible>
  {faqData.map((faq) => (
    <AccordionItem key={faq.id} value={faq.id}>
      <AccordionTrigger>{faq.question}</AccordionTrigger>
      <AccordionContent className="md:w-[58vw] lg:w-[32vw]">{faq.answer}</AccordionContent>
    </AccordionItem>
  ))}
</Accordion>
    </div>
  );
};

const faqData = [
  {
    id: "item-1",
    question: "What permissions does BetterDrive request on my Google Drive?",
    answer: "Only the operations you perform here. We only access files when you specifically interact with them through our interface - no background scanning or file access."
  },
  {
    id: "item-2",
    question: "Is any of my data stored outside Google?",
    answer: "No, it's just you and your Drive privately. We don't store any of your files or content on our servers - everything stays in your Google Drive."
  },
  {
    id: "item-3",
    question: "Can BetterDrive see or read my file contents?",
    answer: "We only access files when you open, share, or organize them through BetterDrive. We never scan, read, or analyze your file contents in the background."
  },
  {
    id: "item-5",
    question: "Can BetterDrive employees access my Google Drive files?",
    answer: "No, our team cannot access your Google Drive files. The connection is directly between you and Google - we act as a secure interface only."
  },
  {
    id: "item-6",
    question: "What happens to my data if I disconnect BetterDrive?",
    answer: "You can revoke access anytime through your Google Account settings. Once disconnected, BetterDrive loses all access to your Drive and we delete any temporary session data."
  },
  {
    id: "item-7",
    question: "Do you share my information with third parties?",
    answer: "Never. We don't share, sell, or monetize your data. Your Google Drive content and personal information stay completely private."
  },
  {
    id: "item-12",
    question: "How do I know BetterDrive is safe to use?",
    answer: "We use Google's official OAuth security standards, the same system trusted by millions of apps."
  }
];


"use client";
import React, { useState, useEffect } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { cn } from "../lib/utils";

export function SignupFormDemo() {
  const [counter, setCounter] = useState(7);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // Fetch waitlist count on component mount
  useEffect(() => {
    fetchWaitlistCount();
  }, []);

  const fetchWaitlistCount = async () => { 
    try {
      const response = await fetch('https://betterdrive-production.up.railway.app/api/waitlist/count');
      const data = await response.json();
      if (data.success) {
        setCounter(data.count);
      }
    } catch (error) {
      console.error('Failed to fetch waitlist count:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    try {
      const response = await fetch('https://betterdrive-production.up.railway.app/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setIsSuccess(true);
        setMessage(`🎉 Welcome to the VIP list! You're #${data.data.position} in line.`);
        setCounter(data.data.position); // Update counter
        setName(""); // Clear form
        setEmail("");
      } else {
        setIsSuccess(false);
        setMessage(data.message || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      setIsSuccess(false);
      setMessage('Network error. Please check your connection and try again.');
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="shadow-input mx-auto w-[95%] max-w-md rounded-none bg-white p-4 rounded-lg md:rounded-2xl md:p-8 dark:bg-black border-[1px] border-neutral-800">
      <h2 className="text-3xl font-bold text-neutral-800 dark:text-neutral-200 text-center">
        Join the VIP List
      </h2>
      <div className="mt-2 mb-4 h-[1px] w-full bg-gradient-to-r from-transparent via-neutral-300 to-transparent dark:via-neutral-700" />
      
      <p className="mt-2 max-w-sm text-sm text-neutral-700 dark:text-neutral-300 text-center">
        <span className="text-3xl text-blue-400 font-semibold">{counter}</span> <br />
        people have booked their Spot!
      </p>

      {message && (
        <div className={`mt-4 p-3 rounded-md text-center text-sm ${
          isSuccess 
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        }`}>
          {message}
        </div>
      )}

      <form className="my-8" onSubmit={handleSubmit}>
        <div className="mb-4 flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
          <LabelInputContainer>
            <Label htmlFor="name" className="text-lg">Name</Label>
            <Input 
              id="name" 
              placeholder="Tyler Durden" 
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </LabelInputContainer>
        </div>
        
        <LabelInputContainer className="mb-4">
          <Label htmlFor="email" className="text-lg">Email Address</Label>
          <Input 
            id="email" 
            placeholder="getmylife@together.com" 
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isSubmitting}
          />
        </LabelInputContainer>

        <button
          className="group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset] disabled:opacity-50 disabled:cursor-not-allowed"
          type="submit"
          disabled={isSubmitting || isSuccess}
        >
          {isSubmitting ? 'Joining...' : isSuccess ? '✓ Joined!' : 'Join Now'}
          <BottomGradient />
        </button>
      </form>
    </div>
  );
}

const BottomGradient = () => {
  return (
    <>
      <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
      <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
    </>
  );
};

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex w-full flex-col space-y-2", className)}>
      {children}
    </div>
  );
};

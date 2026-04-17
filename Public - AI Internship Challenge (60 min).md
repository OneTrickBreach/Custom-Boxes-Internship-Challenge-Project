# Project Overview

## **STEP 2: 60 Minute AI Packaging Designer Build ([PUBLIC]())**

### **Overview**

At CustomBoxes.io, we are not looking for interns who can only talk about AI tools. We are looking for people who can use modern AI, automation, and software tools to build something real, quickly.

Your challenge is to build a working prototype of an AI Packaging Designer that behaves like a practical packaging operator for small businesses.

The tool should take a company URL, understand the brand, recommend an appropriate shipping box from a predefined set of sizes, and generate a black-ink-only shipping box design concept for either kraft or white corrugated boxes.

This is not a brainstorming exercise. This is a build-and-ship exercise focused on real-world constraints.

### **Objective** (e.g. your app/site/tool should):

* Accept a company website URL \+ ability to upload logo / design ideas  
* Analyze the company’s brand using the website as the primary input  
* Understand the company’s likely value proposition, vibe, positioning, and visual cues (leveraging URL entered, but most importantly the home page and about us)  
* Ask whether the user already knows their box size (give current options of our standard sizes and custom sizes from [CustomBoxes.io](http://CustomBoxes.io))   
* Use the box size if known  
* If unknown, ask a short sequence of practical questions that also lead them to know if they need white/kraft box (clean vs rugged) along with box quality (32 ECT vs heavy duty)  
* Recommend the best-fitting box from a predefined set of available sizes, not custom dimensions  
* Generate a black-ink-only shipping box concept for kraft or white corrugated boxes  
* Produce a panel-aware, production-oriented packaging layout, not just a general design idea  
* Show the result in a simple, usable interface with a finalized output  
* Use ROI, comp shop and break-even analysis to demonstrate our value proposition during the process ([website assets](https://customboxes.io/pages/custom-shipping-boxes-roi-breakeven-comp-shop-calculators))

### **Why This Matters**

* Small businesses often cannot afford to hire a package designer  
* General design tools like Canva are too broad and too manual to solve real corrugated packaging workflows  
* Most businesses can’t translate their brand into practical PRINT READY packaging  
* Many still ship in blank boxes because packaging feels too complex or expensive  
* There is a large opportunity to reduce friction between “brand” and “box”  
* We are building tools to automate and simplify real packaging workflows  
* This challenge is meant to test whether you can build a commercially useful solution, not just a technically interesting demo

### **Time Limit**

* 60 minutes total build time, please stick to this  
* Up to 5 additional minutes for recording and submission  
* Due date: April 19th at 11pm Eastern

### **Tools You May Use**

You may use any tools that help you move quickly and produce a stronger result, including:

* Claude / ChatGPT / OpenAI tools  
* Lovable, Base44, or similar builders  
* OpenClaw (cautiously/securely)  
* Your preferred coding environment  
* Lightweight frontend/backend tools  
* APIs, scraping, automation platforms  
* Shopify-related tooling (eventually we’ll link into our Shopify site flow)  
* Any practical tools you believe help you ship faster ([we created a starter cheat sheet](https://docs.google.com/spreadsheets/d/1lzf9WpIn3GGKss65_7Pkrvz-RIHFVcffOI3_pCh4_40/edit?gid=0#gid=0))

### **Core Requirements**

Your solution should combine three key areas:

#### **1\) Brand Understanding from URL Input**

Use the company website as your primary input.

Your tool should infer:

* Brand tone and positioning  
* Likely target customer  
* Visual style and design direction  
* Typography and logo handling approach  
* Messaging style and key signals  
* Packaging style recommendation

The goal is not a full brand audit.  
 The goal is to extract useful signals that influence packaging decisions.

#### **2\) Box Size Recommendation Using Constraints**

Your tool must:

* Ask if the user already knows their box size  
* Accept the size if known  
* If unknown, ask a short series of practical questions

Sizing logic should consider:

* Major product categories (e.g. certain industries prefer white boxes like food, pharmaceuticals, farming, etc)  
* Weight of the product (e.g. below 30 lbs \= 32 ECT boxes, above 30 lbs \= heavy duty)  
* Quantity per shipment  
* Approximate size or bundle size  
* Fragility  
* Need for inserts or void fill  
* Preferred fit, such as tight, standard, or protective  
* Quantity of boxes   
* Note: need to add disclaimer that customer is ultimately responsible for picking the right box size ([and link to our return policy](https://customboxes.io/policies/refund-policy))

Important:

* You should select from a predefined set of box sizes (use [CustomBoxes.io](http://CustomBoxes.io) groups for Standard, Popular Custom size [and “Any Size” boxes pick from list](https://docs.google.com/spreadsheets/d/1dIdwdadmL8N_jQOL7hLtpR2JcJm4jqsaOmHrN_M4BiY/edit?gid=0#gid=0) based on LxWxH)  
* Do not generate arbitrary dimensions  
* You may mock or define a small catalog of sizes, for example 5 to 10 options

Your output must include:

* Recommended box size from your defined set  
* Confidence level  
* Short rationale

#### **3\) Packaging Layout Generation**

Your tool must generate a packaging concept that:

* Uses black ink only  
* Works on kraft or white corrugated boxes  
* Reflects real packaging layout thinking, including:  
  * panel awareness such as top, front, sides, and bottom  
  * hierarchy of information  
  * restrained, production-aware design

This is not decorative AI art. This should resemble something a packaging designer or operator would realistically produce (please see [CustomBoxes.io](http://CustomBoxes.io) for examples).

### **4\) Design Editing and Print-Ready Output**

Your tool must do more than generate a one-time packaging concept. It should:

* Produce an initial design that is plausibly print-ready using black-ink-only corrugated packaging best practices  
* Use reference materials, lookbooks, or example packaging layouts to guide structure, hierarchy, and composition  
* Generate a layout that feels production-aware from the start, not just visually appealing  
* Allow the user to refine or manipulate the design after the initial concept using follow-up AI prompts or simple editing controls

Examples of valid refinements include:

* simplify the layout  
* make the logo larger  
* reduce clutter on the side panels  
* add or remove value-prop trust signals from website  
* make the design feel more premium, minimal, or playful  
* move certain content to a different panel  
* improve print-readiness by reducing detail, tightening hierarchy, or removing problematic elements

Your output should show that the system can:

* create a strong first-pass design from website signals  
* preserve packaging logic while making revisions  
* remain aligned to black-ink corrugated print constraints during editing

The goal is not just image generation. The goal is to simulate a practical AI-assisted packaging design workflow that can move from initial concept to a more production-ready result through iteration.

### **Required Flow**

* User enters company URL  
* Tool analyzes the brand from the website (this is where to ask additional info about the brand/company to leverage info for [ROI, Comp Shop, and Break-even](https://customboxes.io/pages/custom-shipping-boxes-roi-breakeven-comp-shop-calculators) data entry to estimate \# of boxes needed per month ([over 5,000 boxes can link to get a quote](https://customboxes.io/pages/large-order-quote-request-form))  
* Tool asks if box size is known  
* If known, continue  
* If unknown, ask sizing questions  
* Tool recommends a box size from a predefined set (standard, popular custom or [Any Size](https://docs.google.com/spreadsheets/d/1dIdwdadmL8N_jQOL7hLtpR2JcJm4jqsaOmHrN_M4BiY/edit?gid=0#gid=0))  
* Tool generates a packaging concept  
* Tool outputs the final result in a working interface  
* Tool allows the user to revise or manipulate the design using AI prompts and/or simple editing controls

### **Design Constraints**

* Box color must be kraft or white  
* Ink must be black only  
* This is a shipping box, not retail packaging  
* Layout should avoid clutter  
* Panel hierarchy should feel realistic  
* Output should reflect print-aware thinking, not just visuals  
* The initial design should be guided by packaging best-practice references, including website signals, customer reviews, and optional lookbook or example designs if provided  
* The design should be plausibly print-ready as a first pass, not just conceptually interesting  
* The system should support design changes after the initial concept using prompts and/or lightweight editing  
* Revisions should preserve hierarchy, panel logic, and production-aware restraint

### **What a Strong Output Looks Like**

* Min requirement: should at least be able to add logo on 1, 2 or 4 sides and give customer ability to size the logo on each panel)  
* Pulls meaningful signals from the website, not generic summaries  
* Makes a reasonable, explainable box size recommendation  
* Produces a clean, believable initial packaging layout that already feels print-aware  
* Uses packaging references or best-practice examples intelligently rather than generating random art  
* Shows thoughtful placement of logo, messaging, and supporting elements across realistic panels  
* Allows the user to refine the design with prompts or simple controls  
* Maintains packaging logic and print discipline as edits are made  
* Feels like a usable internal tool, not a class project

### **What Weak Output Looks Like**

* Generic branding not tied to the website  
* Random or decorative AI-generated artwork  
* Ignoring box size constraints  
* Inventing unrealistic dimensions  
* Overloading the design with unnecessary content  
* Static mockups with no working flow  
* Over-explaining instead of building

### **What Counts as a Working Prototype**

A working prototype means:

* A user can go from URL to box selection to final packaging output  
* The core flow functions end to end  
* Some internal components may be mocked  
* The main experience should be real and usable  
* Ability to leverage prompts to change the design/layout

### **Required Deliverables**

* Live prototype URL or runnable app  
* 3 to 5 minute screen recording  
* One example with known box size  
* One example with recommended box size  
* Short summary including:  
  * tools used  
  * what is real vs mocked  
  * what you would improve next

### **Minimum Required Features**

* URL input with optional way to upload logo/designs ideas  
* Brand analysis  
* Size-known vs size-unknown branching  
* Box size recommendation from a defined set  
* Black-ink packaging concept generation  
* Visible final output  
* Use [CustomBoxes.io](http://CustomBoxes.io) branding   
* Has AI Agent that can discuss your branding, the financial questions ([ROI, price comparison, break-even, etc](https://customboxes.io/pages/custom-shipping-boxes-roi-breakeven-comp-shop-calculators)), general FAQs and most importantly a Design agent

### **Preferred Features**

* Panel-labeled layout  
* Flattened 2D layout  
* Simple 3D mockup  
* Downloadable output such as image or PDF  
* Print-safe design considerations  
* Thoughtful backend workflow logic

## **Resources available to you**

This document itself might be the most valuable piece of info you have to leverage (hint). Plus, you may use any public or self-sourced materials you believe help you build a stronger solution. Additional CustomBoxes.io reference materials **may be made available upon request and after a signed NDA**. These may include selected internal examples, design references, and workflow context related to the fuller version of the challenge. You are not required to use every resource.  We are evaluating how well you scope, decide, and build under constraints, not how many tools or references you use.

### **What We Are Evaluating**

* Ability to scope and ship quickly  
* Decision-making under constraints  
* Quality of reasoning, not just output  
* Ability to guide AI toward useful results  
* Practical product thinking  
* Ability to build something usable for a real workflow

### **Scoring Rubric** 

Your submission will be evaluated on a 100-point scale:

* 30 points: Packaging layout quality and print-ready design (and to make changes)  
* 20 points: End-to-end working prototype  
* 20 points: Brand understanding from URL  
* 20 points: Box size recommendation quality  
* 5 points: Tool integration and technical judgment  
* 5 points: Polish and clarity

### **Final Note**

If our CEO, with no technical background, used this document to create a unique experience in \~30 minutes, then someone applying for a software and AI-focused internship should be able to build something more ambitious and useful in 60 minutes.

The challenge is not generating ideas quickly. It is turning those ideas into a working product that follows real constraints and behaves like an actual tool.

We are less interested in whether you used the most advanced tools and more interested in whether you:

* Scoped intelligently  
* Made strong decisions  
* Shipped something useful

A strong result should make us think: “This person could help us build real AI-powered tools for CustomBoxes.io immediately and fully lead our charge into AI.”

[Internal Doc Reminder](https://docs.google.com/document/d/1R59jNggdkJSTB2mhBcRhjs6J8Ra9cMrARBm-K774DHs/edit?tab=t.jul1t849dzia)
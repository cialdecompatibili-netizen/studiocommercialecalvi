---
layout: single
title: "Automatic bank reconciliations: how they work"
date: 2026-07-18
permalink: /en/services/accounting-and-financial-statements/riconciliazioni-bancarie-automatiche/
excerpt: "How automatic bank reconciliations work for businesses."
seo_description: "How automatic bank reconciliations work for businesses."
categories:
  - "Accounting and Financial Statements"
ref: art-riconciliazioni-bancarie-automatiche
lang: en
locale: en
---

![Automatic bank reconciliations: how they work]({{ '/assets/images/blog/riconciliazioni-bancarie-automatiche.jpg' | relative_url }})

<p>Comparing the bank statement with accounting entries by hand, line by line, is one of the most repetitive tasks in the firm: file downloaded from the bank, opened in Excel, search for the matching invoice, manual matching. With Open Banking and artificial intelligence this process is almost entirely automated.</p><h2 id="how-automatic-reconciliation-works">How automatic reconciliation works</h2><p>Thanks to the European PSD2 regulation, banks are required to share — only with the account holder's explicit consent — transaction data via API with authorised third parties (AISP). The accounting software connects directly to company accounts via Open Banking and downloads transactions several times a day, with no need to manually export any file from the bank.</p><h2 id="automatic-matching-with-invoices">Automatic matching with invoices</h2><p>Once transactions are downloaded, the system compares them with the sales and purchase invoices already in the accounts (often imported directly from the SdI flow), looking for matches by amount, date and counterparty. Machine learning algorithms today reach automatic matching rates of 90 to 95% of transactions, leaving only the truly ambiguous cases for human review: partial receipts, combined payments of several invoices, unclear payment references.</p><h2 id="what-happens-when-matching-is-not-automatic">What happens when matching is not automatic</h2><p>A partial receipt does not block the system: the amount actually received is recognised and the item stays open for the remainder. In cases of ambiguous or non-standard bank descriptions, an archive of associations between description strings and accounting reasons is built over time, which the system reuses automatically every time the same transaction pattern reappears — progressively reducing the remaining manual work.</p><h2 id="the-real-benefit-time-and-reliability">The real benefit: time and reliability</h2><p>Besides saving hours of work, the main advantage is the reduction of errors typical of manual work (double entries, badly transcribed amounts, forgotten transactions) and updating the company's financial position in real time, not at month end when it is already too late to effectively correct a cash problem.</p><h2 id="how-we-handle-it-for-our-clients">How we handle it for our clients</h2><p>We activate the PSD2 Open Banking connection on company accounts, integrate automatic reconciliation into the journal entry flow and periodically monitor unmatched exceptions, so the accounts always stay aligned with the real bank statement — a requirement that becomes decisive in case of a loan application or tax audit.</p>

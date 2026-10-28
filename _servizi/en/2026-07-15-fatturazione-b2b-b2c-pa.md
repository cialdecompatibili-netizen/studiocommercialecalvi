---
layout: single
title: "E-invoicing for B2B, B2C and public bodies: the differences"
date: 2026-07-15
permalink: /en/services/e-invoicing/fatturazione-b2b-b2c-pa/
excerpt: "The electronic invoice changes format and rules depending on the recipient: a business, a private individual or a public administration. Here are the practical differences."
seo_description: "The electronic invoice changes format and rules depending on the recipient: a business, a private individual or a public administration. Here are the practical differences."
categories:
  - "E-invoicing"
ref: art-fatturazione-b2b-b2c-pa
lang: en
locale: en
---

![E-invoicing for B2B, B2C and public bodies: the differences]({{ '/assets/images/blog/fatturazione-b2b-b2c-pa.jpg' | relative_url }})

<p>Technically, the electronic invoice always goes through the Exchange System (SdI), but the rules for transmission and storage change depending on whether the customer is a business, a private individual or a public body.</p><h2 id="b2b-tra-imprese">B2B: between businesses</h2><p>The invoice goes to the SdI with the recipient code (or certified email address) of the customer business, which receives it in its own receiving channel. It is the simplest case and the easiest to automate by integrating your management software and e-commerce. In the XML file the FormatoTrasmissione field shows FPR12, the format for invoices between private parties.</p><h2 id="b2c-verso-privati">B2C: to private individuals</h2><p>The invoice must still be sent to the SdI, but since a private individual usually has no active receiving channel, the file remains available in the Revenue Agency's reserved area; the customer is given a courtesy paper or PDF copy.</p><h2 id="verso-la-pubblica-amministrazione">To the public administration</h2><p>The public-body invoice uses the FPA12 format (not FPR12) and requires the 6-character Unique Office Code from the IPA register. Two additional codes may be mandatory: the <strong>CIG</strong> (Tender Identification Code, 10 characters), always present for contracts subject to financial flow traceability above 40,000 euros, and the <strong>CUP</strong> (Unique Project Code, 15 characters) when the supply is part of a project funded with public resources. A missing CIG when required causes the SdI to reject the invoice (error code 00432) or the body to refuse it outright, with payment suspended until corrected.</p><h2 id="split-payment-l-iva-che-non-arriva-al-fornitore">Split payment: the VAT that never reaches the supplier</h2><p>Split payment applies to most invoices to the public administration (art. 17-ter, Presidential Decree 633/1972): the body withholds the VAT shown on the invoice and pays it directly to the tax authority, without paying it to the supplier. In the XML file this is signalled by setting the EsigibilitaIVA field to "S": an invoice that mentions split payment in the notes but has a VAT chargeability value other than "S" is inconsistent, and many bodies reject it and ask for it to be reissued. Professionals with a withholding tax on the invoice are among those excluded from this obligation.</p><div class="art-nota"><p>Integrating invoicing with your management software or e-commerce reduces filling-in errors, which are the most common cause of rejections and late payments.</p></div>

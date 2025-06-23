CREATE TABLE `staffToInvoice` (
	`staffId` integer NOT NULL,
	`invoiceId` integer NOT NULL,
	PRIMARY KEY(`staffId`, `invoiceId`)
);

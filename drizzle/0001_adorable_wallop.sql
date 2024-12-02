CREATE TABLE IF NOT EXISTS "images" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "images_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"status" varchar(255) NOT NULL,
	"url" varchar(255) NOT NULL,
	"processedUrl" varchar(255)
);

-- MySQL DB pour Groupomania

-- Table `message`

DROP TABLE IF EXISTS `message`;

CREATE TABLE `message` (
  `id` int NOT NULL AUTO_INCREMENT,
  `message` text NOT NULL,
  `link` varchar(255) DEFAULT NULL,
  `imageUrl` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `UserId` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `UserId` (`UserId`),
  CONSTRAINT `posts_ibfk_1` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table `message`

LOCK TABLES `message` WRITE;

INSERT INTO `message` VALUES (1,'Bienveillance et respect svp 😊',NULL,NULL,'2020-10-27 13:56:34','2020-10-27 14:26:14',1),(5,'😁','https://media.giphy.com/media/3xz2BtNxiBNTisHygM/giphy.gif',NULL,'2020-10-27 14:27:00','2020-10-27 14:27:09',10),(6,'Hello','https://media1.giphy.com/media/m8SQE8720OkEg/giphy.webp?cid=ecf05e47v2zsgqoae9u5sphgxnvuqbkc4344wbowrl56mijn&rid=giphy.webp',NULL,'2020-10-27 14:27:56','2020-10-27 14:28:29',11),(7,'Je vous surveille 😉','https://media2.giphy.com/media/fGFpff9dvV9LO/giphy.webp?cid=ecf05e47d401mllsp4rzpmqpxmxr3i16noq119jemrp0j7ng&rid=giphy.webp',NULL,'2020-10-27 14:30:33','2020-10-27 14:30:33',1);

UNLOCK TABLES;

-- Table structure for table `users`

DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `pseudo` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `photo` varchar(255) DEFAULT NULL,
  `bio` varchar(500) DEFAULT NULL,
  `admin` tinyint(1) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;

INSERT INTO `users` VALUES (1,'admin','admin@mail.com','$2b$10$ullNHu9dYYSjH0ioi7SpyemMNhW7vdIZ6aGBw.D7.bxArp58J8Vdq','http://localhost:3000/upload/profil_admin1603808637091.png',NULL,1,'2020-10-27 13:56:03','2020-10-27 14:23:57'),(10,'Cyril','cyril@mail.com','$2b$10$KvD1o7KWzv5hksCQV5VqveWgZuxh5rZOAQ5YCdBN90hxZDq9PEUBm',NULL,NULL,0,'2020-10-27 14:26:25','2020-10-27 14:26:25'),(11,'Marco','marc@mail.com','$2b$10$Fu.apmLEqIm5uvMHe12adO595rnlnojNWk38W3VSMazlF8EIyVoRW',NULL,NULL,0,'2020-10-27 14:27:25','2020-10-27 14:27:25'),(12,'Estelle','estelle@mail.com','$2b$10$Vbkq3b4j97sbGuBj0ayS2.vDwFM9VgA6nzOMdI4pnQnzqpOurgkMe',NULL,NULL,0,'2020-10-27 14:28:53','2020-10-27 14:28:53');

UNLOCK TABLES;
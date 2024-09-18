/* Async way ----------------------------*/
const fs = require("fs/promises");

(async () => {
    // file.stat => informations about the file
    try {
        const file = await fs.open("test.txt", "w");

        for (let i = 0; i < 1000000; i++) await file.write(`${i}`);

        file.close();
    } catch (error) {
        console.log(`An error Occured > ${error}`);
    }
})();

/* Streams way ----------------------------*/
const fs = require("fs/promises");

(async () => {
    try {
        const file = await fs.open("test.txt", "w");

        const stream = file.createWriteStream(); // Create a writable stream to the file

        for (let i = 0; i < 1000000; i++) {
            const buffer = Buffer.from(` ${i} `, "utf-8");
            stream.write(buffer); // Write the buffer to the file
        }

        stream.close();
        file.close();
    } catch (error) {
        console.log(`An error Occured > ${error}`);
    }
})();

/*------------ streams best practice ----------*/

const fs = require("fs/promises");

(async () => {
    try {
        console.time("write");

        const file = await fs.open("text.txt", "w");

        const stream = file.createWriteStream();

        let i = 0;
        const writeMany = () => {
            while (i < 1000000) {
                const buff = Buffer.from(` ${i} `, "utf-8");
                // The last write
                if (i === 999999) return stream.end(buff);

                // Check whenever the stream's intern buffer is full and break the loop
                if (!stream.write(buff)) break;

                i++;
            }
        };

        writeMany(); // First call to write the first time to the stream

        // Once the stream's intern Buffer is emtied , continue writing... drain event means that the intern buffer is empty
        stream.on("drain", () => {
            writeMany(); // Write again (i is global to this function and the loop will continue where it stops until the last number)
        });

        // When the stream is ended , log the time it takes
        stream.on("finish", () => {
            console.timeEnd("write");

            // Close the File
            file.close();
        });
    } catch (error) {}
})();

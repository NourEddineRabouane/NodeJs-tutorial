const fs = require("node:fs/promises");

(async () => {
    try {
        // Open the file in read mode
        const readfile = await fs.open("text.txt", "r");
        const writefile = await fs.open("dest.txt", "w");

        const readStream = readfile.createReadStream();
        const writeStream = writefile.createWriteStream();

        // Listening to the 'data' event the stream starts to read from the file in chunks
        readStream.on("data", (chunk) => {
            if (!writeStream.write(` ${chunk}`)) {
                // When the write stream's Buffer is full, stop reading from the source file
                readStream.pause();
            }
        });

        // When the write stream's Buffer got emptied, resume reading from the source file
        writeStream.on("drain", () => {
            readStream.resume();
        });
    } catch (error) {
        // In case of an error
        console.log("An ERROR occured : " + error);
    }
})();

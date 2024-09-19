const fs = require("node:fs");

(async () => {
    try {
        // Open the read stream and write stream directly from fs
        const readStream = fs.createReadStream("text.txt", {
            highWaterMark: 64 * 1024, // Optional: Set the chunk size
        });
        const writeStream = fs.createWriteStream("dest.txt");

        let split = "";

        // Listen to the 'data' event when the stream reads chunks from the file
        readStream.on("data", (chunk) => {
            // Split the chunk of data into an array
            let numbers = chunk.toString("utf-8").split("  ");

            // Handle splitting logic (concatenating the missing part from the previous chunk)
            if (Number(numbers[0]) !== Number(numbers[1]) - 1) {
                if (split) numbers[0] = split.trim() + numbers[1].trim();
            }

            // Check if the last number is split incorrectly and store it in the split variable
            if (
                Number(numbers[numbers.length - 2]) + 1 !==
                Number(numbers[numbers.length - 1])
            ) {
                split = numbers.pop();
            }

            // Example of processing numbers (write even numbers to the destination file)
            numbers.forEach((e) => {
                let n = Number(e);
                if (n % 2 === 0)
                    if (!writeStream.write(` ${n}`)) {
                        // When the write stream's Buffer is full, pause reading from the source file
                        readStream.pause();
                    }
            });
        });

        // When the write stream's Buffer is emptied, resume reading from the source file
        writeStream.on("drain", () => {
            readStream.resume();
        });

        // Handle errors in streams
        readStream.on("error", (err) => {
            console.error("Read stream error:", err);
        });
        writeStream.on("error", (err) => {
            console.error("Write stream error:", err);
        });

        // When reading is finished
        readStream.on("end", () => {
            console.log("Finished reading the file.");
            writeStream.end(); // Close the write stream
        });
    } catch (error) {
        // Catch any errors in the async function
        console.log("An error occurred: " + error);
    }
})();

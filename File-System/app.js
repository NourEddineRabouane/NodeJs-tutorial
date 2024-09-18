const fs = require("fs/promises");
const FILE_PATH = __dirname + "/command.txt";

(async () => {
    try {
        // Commands
        const CREATE_FILE = "create a file";
        const DELETE_FILE = "delete the file";
        const RENAME_FILE = "rename file";
        const ADD_TO_FILE = "add to file";
        const EXIT = "exit";
        //
        const createFile = async (path) => {
            try {
                // Check if the file already exists
                let existingFileHandler = await fs.open(path, "r");
                existingFileHandler.close();

                return console.log(`File ${path} already exists !`);
            } catch (e) {
                const file = await fs.open(path, "w");
                console.log("A new file was successfully created");
                file.close();
            }
        };
        const deleteFile = async (path) => {
            try {
                // Check if the file already exists
                await fs.unlink(path);
                console.log("File has been deleted successfully.");
            } catch (e) {
                if (e.code === "ENOENT")
                    console.log("No such File with in this path " + path);
                else
                    console.log(
                        `An Error occured while deleting the File ! > ` + e
                    );
            }
        };
        const renameFile = async (path, topath) => {
            try {
                await fs.rename(path, topath);
                console.log(
                    `File ${path} has been renamed to ${topath} successfully.`
                );
            } catch (e) {
                if (e.code === "ENOENT")
                    console.log("No such File with this path " + path);
                else
                    console.log(
                        `An Error occured while renaming the File > ${e}`
                    );
            }
        };
        const addToFile = async (path, content) => {
            try {
                let existingFileHandler = await fs.open(path, "r");
                existingFileHandler.close();
                await fs.writeFile(path, content, "utf8");
                console.log(`Content was added to ${path} successfully.`);
            } catch (error) {
                console.log(`File does not EXIST !`);
            }
        };

        // Open the file before doing anything... "close it later!"
        const CommandFile = await fs.open(FILE_PATH, "r");
        // Watch the File
        const watcher = fs.watch(FILE_PATH);

        // Deal with the change event as event Emitter
        CommandFile.on("change", async () => {
            // Get the size of the file
            let size = (await CommandFile.stat()).size;
            // Allocate the the rigth buffer size that equals to the file size
            let Buff = Buffer.alloc(size);
            // Set the place that we want to fill the buffer from to 0
            let offset = 0;
            //  The number of bytes to read
            let length = Buff.byteLength;
            // Set the place that we want to read the file from to 0
            let positon = 0;
            // We want to read tthe whole file content from beginig to the end
            await CommandFile.read(Buff, offset, length, positon);

            // Grab the entire COMMAD
            const command = Buff.toString("utf-8");

            // In case of Creating a file
            if (command.includes(CREATE_FILE)) {
                let _idx = command.indexOf(CREATE_FILE);
                let path = command.substring(_idx + CREATE_FILE.length + 1);
                // Create a file : using "create a file <path>"
                createFile(path);
            }
            // In case of Deleting a file
            if (command.includes(DELETE_FILE)) {
                let _idx = command.indexOf(DELETE_FILE);
                let path = command.substring(_idx + DELETE_FILE.length + 1);
                // Delete a file : using "delete file <path>"
                deleteFile(path);
            }
            // In case of Renaming a file
            if (command.includes(RENAME_FILE)) {
                let _idx = command.indexOf(RENAME_FILE);
                let _idxt = command.indexOf(" to ");
                let path = command.substring(
                    _idx + RENAME_FILE.length + 1,
                    _idxt
                );
                let newpath = command.substring(_idxt + 4);
                renameFile(path, newpath);
            }
            // In case of Adding content to the file
            if (command.includes(ADD_TO_FILE)) {
                let _idx = command.indexOf(ADD_TO_FILE);
                let _idxc = command.indexOf(" content: ");
                let path = command.substring(
                    // Rename a file : using rename file <path> to <new path>
                    _idx + ADD_TO_FILE.length + 1,
                    _idxc
                );
                let content = command.substring(_idxc + 10);
                // Add to file : using add to file <path> content: <content

                addToFile(path, content);
            }
            // Exit the full process
            if (command.includes(EXIT)) {
                process.exit();
            }
        });

        //
        for await (let event of watcher) {
            if (event.eventType === "change") {
                // The File was changed
                CommandFile.emit("change");
            }
        }
    } catch (err) {
        console.error(err);
    }
})();

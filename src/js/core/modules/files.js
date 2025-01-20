const file_api = {
    files: null,

    // Handle fetching the filesystem from the database
    fetch: async () => {
        if (file_api.files) return file_api.files;
        let raw_data = await db.get("files")
        if (!(raw_data instanceof Object)) {
            raw_data = {    
                "": {
                    "home": { link: "home" }
                },
                "home": {
                    "Documents": { link: "home/Documents" }
                },
                "home/Documents": {
                    "somefile.txt": {
                        content: "hello",
                        size: 5
                    }
                }
            };
            db.set("files");
        }
        file_api.files = raw_data;
        return raw_data;
    },

    // List the structure of a specific path
    list: async (path) => {
        return (await file_api.fetch())[path.slice(1)];
    },

    // Read a file at a specific location
    read: async (path) => {
        const data = /(\/.+)\/([\w\d .]+)/.exec(path);
        return (await file_api.list(data[1]))[data[2]];
    },

    // Write to a file at a specific location
    write: async (path, content) => {
        const data = /\/(.+)\/([\w\d .]+)/.exec(path);

        // Not sure what to check for bytes yet, I'll standardize it later.
        // if (!(typeof content === "string" || content instanceof Uint8Array)) return false;
        if (typeof content !== "string") return false;

        const files = await file_api.fetch();
        files[data[1]][data[2]] = { content: content, size: content.length };
        file_api.files = files;
        db.set("files", files);
        return true;
    }
};

const file_api = {
    fetch: async () => {
        let files = JSON.parse(await db.get("files")) || {
            "": {
                "home": { link: "home" }
            },
            "home": {
                "documents": { link: "home/documents" },
                "downloads": { link: "home/downloads" }
            },
            "home/documents": {
                "test.txt": { content: "This is a test file.", size: 5 }
            },
            "home/downloads": {
                "anothertest.txt": { content: "Another test file.", size: 5 }
            }
        };
        db.set("files", JSON.stringify(files));
        return files;
    },
    list: async (parts) => {
        return (await file_api.fetch())[(parts || []).join("/")];
    },
    read: async (path) => {
        const parts = path.split("/").slice(1);
        const files = await file_api.list(parts.slice(0, -1));
        return files && files[parts[parts.length - 1]];
    },
    write: async (path, content) => {
        const parts = path.split("/").slice(1);
        const parent = parts.slice(0, -1).join("/");
        const files = await file_api.fetch();
        if (!files[parent]) return false;

        const filename = parts[parts.length - 1];
        const existing_file = files[parent][filename];
        if (existing_file && existing_file.link) {
            console.error("Attempted to overwrite an existing folder!");
            return false;
        }

        files[parent][filename] = {
            content: content,
            size: content.length
        }
        db.set("files", JSON.stringify(files));
        return true;
    }
};

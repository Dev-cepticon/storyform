const DEBUG = true;

export function log(message, ...args) {
    if (DEBUG){ 
        console.log(`Storyform | ${message}`, ...args);
    }
}
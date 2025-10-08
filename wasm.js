async function main() {
    let decoder = new TextDecoder("utf-8");
    let encoder = new TextEncoder();
    const wasm = {memory: null, exports: null};

    const strFromMemory = (ind, len) => decoder.decode(new Uint8Array(wasm.memory.buffer, ind, len));

    // Define JS functions and other symbols which will be imported into the Wasm module
    const mySymbols = {
        log_string: (ind, len) => {
            console.log(strFromMemory(ind, len));
        },
        alert_string: (ind, len) => {
            alert(strFromMemory(ind, len));
        }
    }

    // Instantiate the Wasm module
    const result = await WebAssembly.instantiateStreaming(
        fetch("wasm_strings.wasm"), 
        { env: mySymbols }
    );

    // Get its exported functions and other symbols
    wasm.exports = result.instance.exports;
    wasm.memory = wasm.exports.memory;

    // Send a string from the Rust side to the JS side 
    // (greet() calls both alert_string() and log_string() which we defined above)
    wasm.exports.greet();

    // Then try sending a different string back to the Rust side:
    // First encode the JS string as an UTF-8 string, which is what Rust uses
    const bytes = encoder.encode(
        "This mostly lowercase JS string was passed to Rust and back!"
    );
    // Then tell Rust to allocate some part of memory which we can write the string to
    const ptr = wasm.exports.alloc(bytes.length);
    // Make a write-able view of the memory and write our bytes to the allocated region
    new Uint8Array(wasm.memory.buffer).set(bytes, ptr);
    // Make Rust parrot the string back at us to verify that everything worked
    wasm.exports.log_string_from_memory(ptr, bytes.length);
    wasm.exports.log_modified_string_from_memory(ptr, bytes.length);
    // Finally deallocate the memory region so it can be reused later
    wasm.exports.dealloc(ptr, bytes.length);
}

main();
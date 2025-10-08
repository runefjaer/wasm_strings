unsafe extern "C" {
    safe fn log_string(ptr: *mut u8, len: usize);
    safe fn alert_string(ptr: *mut u8, len: usize);
}

#[unsafe(no_mangle)]
pub unsafe fn greet() {
    let mut s1 = String::from("Hello, this is coming from the other side!");
    alert_string(s1.as_mut_ptr(), s1.len());
    let mut s2 = String::from("This was a Rust string.");
    log_string(s2.as_mut_ptr(), s2.len());
}

#[unsafe(no_mangle)]
pub unsafe fn alloc(len: usize) -> *mut u8 {
    let mut buf = Vec::with_capacity(len);
    let ptr = buf.as_mut_ptr();
    std::mem::forget(buf);
    return ptr;
}

#[unsafe(no_mangle)]
pub unsafe fn dealloc(ptr: *mut u8, len: usize) {
    unsafe {
        std::mem::drop(Vec::from_raw_parts(ptr, len, len));
    }
}

#[unsafe(no_mangle)]
pub unsafe fn log_string_from_memory(ptr: *mut u8, len: usize) {
    log_string(ptr, len);
}

#[unsafe(no_mangle)]
pub unsafe fn log_modified_string_from_memory(ptr: *mut u8, len: usize) {
    let bytes = unsafe {Vec::from_raw_parts(ptr, len, len)};
    let my_str = unsafe {str::from_utf8_unchecked(&bytes)};
    let mut upper = my_str.to_uppercase();
    log_string(upper.as_mut_ptr(), upper.len());
    std::mem::forget(bytes);
}

/* This function ensures that a given function (func) is not called too frequently. 
It introduces a delay between successive calls, ensuring that the function is only 
executed after the delay has passed since the last call.
 */
export function debounce(func, delay) {
  let timerId
  return function (...args) {
    clearTimeout(timerId) // Clears any existing timer
    timerId = setTimeout(() => {
      // Sets a new timer
      func.apply(this, args) // Calls the function with the given arguments
    }, delay)
  }
}

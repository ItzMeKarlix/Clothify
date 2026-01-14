
/**
 * Displays a security warning in the console to prevent Self-XSS and social engineering attacks.
 * This is displayed when the application starts.
 */
export const showConsoleWarning = () => {
    // Only run in production or if explicitly enabled, but for this request we'll run it always
    // nicely formatted to catch attention
    
    // Prevent the warning from being cleared easily by preserving log if possible? 
    // No, standard console.log is enough.

    const titleStyle = [
        'color: #ef4444', // Red-500
        'font-size: 40px',
        'font-weight: bold',
        'text-shadow: 1px 1px black',
        'padding-bottom: 5px'
    ].join(';');

    const bodyStyle = [
        'color: #3f3f46', // Zinc-700
        'font-size: 16px',
        'line-height: 1.5'
    ].join(';');

    const importantStyle = [
        'color: #ef4444', 
        'font-size: 16px',
        'font-weight: bold'
    ].join(';');

    // Delay slightly to ensure it's not buried by other initial logs
    setTimeout(() => {
        console.log('%cSTOP!', titleStyle);
        console.log(
            '%cThis is a browser feature intended for developers.\nIf someone told you to copy-paste something here to enable a Clothify feature or "hack" someone\'s account, it is a scam and will give them access to your Clothify account.',
            bodyStyle
        );
        console.log(
            '%cDo not paste any code here unless you know exactly what you are doing.',
            importantStyle
        );
    }, 2000);
};

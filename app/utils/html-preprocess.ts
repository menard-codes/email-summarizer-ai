import { load } from "cheerio";

export function parseAndCleanHtml(htmlStr: string) {
    const $ = load(htmlStr);

    // Remove unwanted tags
    $('script, style, iframe, .gmail_quote, .x_gmail_quote').remove();

    // Remove inline styles
    $('*').removeAttr('style');

    // Remove comments
    $('*').contents().filter(function() {
        return this.type === 'comment';
    }).remove();

    // remove #appendonsend

    // Focus on main content (this is an example, adjust as needed)
    const mainContent = $('main').html() || $('article').html() || $('body').html();

    // this is specifically for Gmail as it sends the messages as threads themselves
    const targetElement = $('#appendonsend');
    targetElement.nextAll().remove();
    targetElement.remove();
    // TODO: .gmail_quote .x_gmail_quote

    return mainContent;
}

export function extractContent(cleanedHtml: string) {
    const $ = load(cleanedHtml);

    // Remove any remaining scripts, styles, or other non-content elements
    $('script, style, meta, link').remove();

    // Function to process each element
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function processElement(element: any) {
        const tag = element.name;
        let content = '';

        if (tag === 'img') {
            // For images, return the alt text or src
            return `[Image: ${$(element).attr('alt')}]`;
        } else if (tag === 'a') {
            // For links, include the text and href
            return `${$(element).text()}`;
        } else if (['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li'].includes(tag)) {
            // For paragraphs, headings, and list items, process their children
            $(element).contents().each((_, el) => {
                if (el.type === 'text') {
                    content += $(el).text().trim() + ' ';
                } else if (el.type === 'tag') {
                    content += processElement(el) + ' ';
                }
            });
            return content.trim() + '\n\n';
        } else {
            // For other elements, just process their children
            $(element).contents().each((_, el) => {
                if (el.type === 'text') {
                content += $(el).text().trim() + ' ';
            } else if (el.type === 'tag') {
                content += processElement(el) + ' ';
            }
            });
            return content.trim();
        }
    }

    // Process the body
    const body = $('body')[0]
    let extractedContent = processElement(body);

    // Clean up extra whitespace
    extractedContent = extractedContent.replace(/\s+/g, ' ').trim();

    return extractedContent;
}


export const HIGHLIGHT_SCRIPT = `
<script>
  // Suppress CORS and other resource loading errors in the iframe console
  (function() {
    const originalError = console.error;
    const originalWarn = console.warn;
    
    // Patterns to suppress
    const suppressPatterns = [
      /CORS/i,
      /Cross-Origin/i,
      /blocked by CORS policy/i,
      /Failed to load resource/i,
      /net::ERR_FAILED/i,
      /Access-Control-Allow-Origin/i,
      /Mixed Content/i,
    ];
    
    console.error = function(...args) {
      const message = args.join(' ');
      if (!suppressPatterns.some(pattern => pattern.test(message))) {
        originalError.apply(console, args);
      }
    };
    
    console.warn = function(...args) {
      const message = args.join(' ');
      if (!suppressPatterns.some(pattern => pattern.test(message))) {
        originalWarn.apply(console, args);
      }
    };
    
    // Suppress error events on the window
    window.addEventListener('error', function(e) {
      if (e.message && suppressPatterns.some(pattern => pattern.test(e.message))) {
        e.preventDefault();
        e.stopPropagation();
        return true;
      }
    }, true);
  })();
</script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/mark.js/8.11.1/mark.min.js"></script>
<script>
  function initMarker() {
    if (typeof Mark === 'undefined') {
      setTimeout(initMarker, 100);
      return;
    }

    try {
      var marker = new Mark(document.body);

      window.addEventListener("message", (event) => {
        try {
          const data = event.data;
          if (data.type === 'HIGHLIGHT') {
            marker.unmark({
              done: function() {
                marker.mark(data.text, {
                  "element": "mark",
                  "className": "highlight-mark",
                  "acrossElements": true,
                  "separateWordSearch": false,
                  "accuracy": "partially",
                  "scroll": true,
                  "done": function(totalMarks) {
                    // Scroll to the first highlighted mark
                    const firstMark = document.querySelector("mark.highlight-mark");
                    if (firstMark) {
                      firstMark.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                      });
                    }
                  }
                });
              }
            });
          }
          if (data.type === 'CLEAR') {
            marker.unmark();
          }
        } catch (error) {
          console.error('MarkJS: Error processing message:', error);
        }
      });
    } catch (error) {
      console.error('MarkJS: Error initializing marker:', error);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMarker);
  } else {
    initMarker();
  }
</script>

<style>
.highlight-mark {
  background-color: #ffff00 !important;
  color: #000000 !important;
  padding: 2px 4px !important;
  border-radius: 3px !important;
  font-weight: bold !important;
}
</style>
`;

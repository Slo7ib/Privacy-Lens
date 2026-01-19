export function Donation() {
  return (
    <div className="flex flex-col space-y-6">
      <div>
        <h2 className="mb-3.5 text-xl font-semibold">
          Your donation helps us more than you think!
        </h2>
        <div>
          <a href="https://www.buymeacoffee.com/SalehOmar" target="_blank" rel="noopener noreferrer">
            <img
              src="https://cdn.buymeacoffee.com/buttons/v2/arial-yellow.png"
              alt="Buy Me A Coffee"
              style={{ height: "60px !important", width: "217px !important" }}
            />
          </a>
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="mb-3 text-lg font-semibold">Support & Feedback</h3>
        <p className="mb-4 text-sm text-white">
          We'd love to hear from you! Share your feedback, report issues, or suggest new features.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLSf5bnQh0ho8XChAyrw7Kisx0sHM6StnkDGiBxLWHSjcRGRkfQ/viewform?usp=publish-editor"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            Send Feedback
          </a>
          <a
            href="https://slo7ib.github.io/PrivacyLensSite/index.html"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
            Visit Website
          </a>
        </div>
      </div>
    </div>
  );
}
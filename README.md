# Journal App

A modern, feature-rich journaling application built with Next.js that allows users to create and manage journal entries with advanced features like image text extraction (OCR), entry categorization, and rich text formatting.

## Features

- 📝 Create and manage journal entries
- 📸 Extract text from images using OCR
- 🏷️ Categorize entries with qualifiers (tone, topic, mood, context)
- 🌓 Dark mode support
- 🔒 User authentication
- 📱 Responsive design
- ✨ Modern UI with Shadcn/ui components

## Tech Stack

- [Next.js](https://nextjs.org/) - React framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Shadcn/ui](https://ui.shadcn.com/) - UI components
- [Lucide Icons](https://lucide.dev/) - Icons
- OCR capabilities for image text extraction

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/journal-app.git
cd journal-app
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file in the root directory and add necessary environment variables:
```env
# Add your environment variables here
NEXT_PUBLIC_API_URL=your_api_url
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
journal-app/
├── app/                    # Next.js app directory
│   ├── components/        # Reusable components
│   ├── lib/              # Utility functions and services
│   └── ...               # Other app directories
├── public/                # Static files
├── styles/                # Global styles
└── ...                   # Config files
```

## Features in Detail

### Journal Entries
- Create, edit, and manage journal entries
- Rich text formatting
- Automatic title generation from content
- Entry categorization with qualifiers

### Image Text Extraction
- Upload multiple images
- OCR processing
- Manual text editing capability
- Compression and optimization

### Entry Qualifiers
- Tone classification
- Topic categorization
- Mood tracking
- Context addition

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 
# Stripe Integration Guide

This folder contains the complete backend logic for Stripe payment integration. The frontend components are located in `frontend-alumni/components/stripe`.

## Integration Steps

### 1. Backend Integration

#### Install Dependency
```bash
npm install stripe
```

#### Register Routes
Open `app.js` and add the following line with the other route definitions:

```javascript
// Stripe Routes
app.use('/api/v1/stripe', require('./stripe/routes.stripe'));
```

#### Environment Variables
Add to your `.env` file:
```env
STRIPE_SECRET_KEY=sk_test_...
```

### 2. Frontend Integration

#### Install Dependencies
```bash
cd frontend-alumni
npm install @stripe/stripe-js @stripe/react-stripe-js
```

#### Environment Variables
Add to `frontend-alumni/.env.local`:
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

#### Usage in Campaign Page
Import the modal and use it in your page:

```tsx
import DonationModal from '@/components/stripe/DonationModal';

// State
const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);

// JSX
<button onClick={() => setIsDonationModalOpen(true)}>Donate Now</button>

<DonationModal 
  isOpen={isDonationModalOpen}
  onClose={() => setIsDonationModalOpen(false)}
  campaignId={campaign._id}
  campaignTitle={campaign.title}
/>
```

---
*Created by Sarthak AI Assistant*

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    const { plan, email, name } = req.body;
    const amount = plan === 'monthly' ? 900 : 9700; // $9 or $97 in cents
    const currency = 'USD';
    
    try {
        // Flutterwave integration
        const response = await fetch('https://api.flutterwave.com/v3/payments', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                tx_ref: `supreme_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
                amount: amount / 100,
                currency: currency,
                redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment-success`,
                customer: {
                    email: email,
                    name: name || email.split('@')[0]
                },
                meta: {
                    plan: plan
                },
                customizations: {
                    title: 'SupremeInvoice Pro',
                    description: `${plan === 'monthly' ? 'Monthly' : 'Lifetime'} Subscription`,
                    logo: `${process.env.NEXT_PUBLIC_APP_URL}/icons/icon-192.png`
                }
            })
        });
        
        const data = await response.json();
        
        if (data.status === 'success') {
            return res.status(200).json({ 
                success: true, 
                payment_link: data.data.link,
                reference: data.data.tx_ref
            });
        } else {
            return res.status(400).json({ error: data.message });
        }
    } catch (error) {
        console.error('Payment error:', error);
        return res.status(500).json({ error: 'Payment processing failed' });
    }
}

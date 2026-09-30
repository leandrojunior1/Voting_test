import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, candidato } = await request.json();

    if (!email || !candidato) {
      return NextResponse.json({ error: 'E-mail e candidato são obrigatórios' }, { status: 400 });
    }

    // Chamada à API do Mercado Pago para criar o pagamento Pix de R$ 1,00
    const mpResponse = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': `${email}-${Date.now()}` // Evita cobrança dupla acidental
      },
      body: JSON.stringify({
        transaction_amount: 1.00,
        description: `Voto na Votação Oficial - Candidato: ${candidato.toUpperCase()}`,
        payment_method_id: 'pix',
        payer: {
          email: email,
        },
        metadata: {
          candidato: candidato,
          email: email
        }
      })
    });

    const data = await mpResponse.json();

    if (!mpResponse.ok) {
      console.error('Erro Mercado Pago:', data);
      return NextResponse.json({ error: 'Erro ao gerar Pix no gateway de pagamento' }, { status: 500 });
    }

    // Retorna o QR Code e o código Pix Copia e Cola para o front-end
    const pointOfInteraction = data.point_of_interaction;
    const qrCodeBase64 = pointOfInteraction?.transaction_data?.qr_code_base64;
    const qrCodeCopyPaste = pointOfInteraction?.transaction_data?.qr_code;
    const paymentId = data.id;

    return NextResponse.json({
      success: true,
      paymentId,
      qrCodeBase64,
      qrCodeCopyPaste
    });

  } catch (error) {
    console.error('Erro interno:', error);
    return NextResponse.json({ error: 'Erro interno ao processar requisição' }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // O Mercado Pago envia notificações de vários tipos. Queremos apenas eventos de pagamento.
    if (body.type === 'payment' || body.action === 'payment.created') {
      const paymentId = body.data?.id || body.id;

      // Consulta os detalhes do pagamento direto na API do Mercado Pago para garantir segurança
      const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}`
        }
      });

      const paymentData = await mpRes.json();

      // Verifica se o pagamento foi realmente aprovado
      if (paymentData.status === 'approved') {
        const metadata = paymentData.metadata;
        const candidato = metadata?.candidato; // 'lula' ou 'flavio'
        const email = metadata?.email;

        if (candidato && email) {
          // 1. Salva o voto na tabela de histórico
          await supabaseAdmin.from('votos').insert([
            { candidato, email, payment_id: String(paymentId) }
          ]);

          // 2. Atualiza o contador cacheado no banco de forma atômica
          const { data: cacheAtual } = await supabaseAdmin
            .from('placar_cache')
            .select('*')
            .eq('id', 1)
            .single();

          if (cacheAtual) {
            const novoLula = candidato === 'lula' ? cacheAtual.votos_lula + 1 : cacheAtual.votos_lula;
            const novoFlavio = candidato === 'flavio' ? cacheAtual.votos_flavio + 1 : cacheAtual.votos_flavio;

            await supabaseAdmin
              .from('placar_cache')
              .update({ votos_lula: novoLula, votos_flavio: novoFlavio })
              .eq('id', 1);
          }
        }
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('Erro no webhook:', error);
    return NextResponse.json({ error: 'Erro ao processar webhook' }, { status: 500 });
  }
}
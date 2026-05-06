import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Resend } from 'resend';

// Vercel recomienda verificar la procedencia de la petición
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (
      process.env.CRON_SECRET &&
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return new Response('Unauthorized', { status: 401 });
    }

    if (!process.env.RESEND_API_KEY) {
      console.error("Falta RESEND_API_KEY");
      return new Response('Falta configuración de Resend', { status: 500 });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    // Calcular fecha objetivo (hoy + 15 días)
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 15);
    const targetDateString = targetDate.toISOString().split('T')[0];

    // Consultar carpetas
    const { data: carpetas, error } = await supabase
      .from('carpetas_fiscales')
      .select('*')
      .eq('fecha_vencimiento', targetDateString)
      .neq('estado', 'RESUELTO');

    if (error) {
      console.error("Error al consultar Supabase:", error);
      return new Response('Error de base de datos', { status: 500 });
    }

    if (!carpetas || carpetas.length === 0) {
      return NextResponse.json({ message: "No hay carpetas próximas a vencer en 15 días." });
    }

    // Construir contenido del correo
    let htmlContent = `
      <h2>🚨 Alerta Preventiva: Carpetas Próximas a Vencer</h2>
      <p>Las siguientes carpetas fiscales tienen su fecha de vencimiento programada exactamente para dentro de <strong>15 días (${targetDateString})</strong> y aún no se encuentran resueltas:</p>
      <table border="1" cellpadding="10" cellspacing="0" style="border-collapse: collapse; width: 100%;">
        <thead>
          <tr style="background-color: #f2f2f2;">
            <th>N° Orden</th>
            <th>N° Carpeta Fiscal</th>
            <th>Investigado</th>
            <th>Delito / Artículo</th>
            <th>Fiscal Responsable</th>
          </tr>
        </thead>
        <tbody>
    `;

    carpetas.forEach(c => {
      htmlContent += `
        <tr>
          <td>${c.numero_orden || 'S/N'}</td>
          <td><strong>${c.numero_cf}</strong></td>
          <td>${c.investigado}</td>
          <td>${c.articulo_cp}</td>
          <td>${c.fiscal_responsable}</td>
        </tr>
      `;
    });

    htmlContent += `
        </tbody>
      </table>
      <br/>
      <p>Por favor, tome las acciones correspondientes para evitar el vencimiento de los plazos legales.</p>
      <p><em>Este es un correo automático generado por el Sistema de Gestión de Carpetas Fiscales DEPDICC Iquitos.</em></p>
    `;

    // Enviar el correo
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'DEPDICC Alertas <onboarding@resend.dev>', // Usamos el correo de prueba de Resend por ahora
      to: ['mcieza46@gmail.com'],
      subject: `🚨 Alerta: ${carpetas.length} carpeta(s) vencerán en 15 días`,
      html: htmlContent,
    });

    if (emailError) {
      console.error("Error al enviar correo con Resend:", emailError);
      return new Response('Error al enviar correo', { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Se enviaron alertas para ${carpetas.length} carpetas.`,
      emailId: emailData?.id 
    });

  } catch (err: any) {
    console.error("Error inesperado en cron job:", err);
    return new Response('Error interno del servidor', { status: 500 });
  }
}

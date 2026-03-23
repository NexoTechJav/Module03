import React, { useMemo, useRef, useState } from 'react';
import Notification from './Notification';

const BACKEND_URL = 'http://localhost:3010';
const MAX_CV_BYTES = 5 * 1024 * 1024; // 5MB

type FieldErrors = Partial<Record<string, string>>;

function isNonEmpty(value: string): boolean {
  return value.trim().length > 0;
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function getCvError(file: File): string | null {
  const ext = file.name.toLowerCase();
  const isAllowedByExt = ext.endsWith('.pdf') || ext.endsWith('.docx');
  const isAllowedByType =
    file.type === 'application/pdf' ||
    file.type ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

  if (!isAllowedByExt && !isAllowedByType) {
    return 'El CV debe ser un archivo PDF o DOCX.';
  }

  if (file.size > MAX_CV_BYTES) {
    return 'El CV no puede superar 5MB.';
  }

  return null;
}

export default function AddCandidateForm(props: { onCancel: () => void }) {
  const [values, setValues] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    education: '',
    workExperience: '',
  });

  const [cvFile, setCvFile] = useState<File | null>(null);
  const cvInputRef = useRef<HTMLInputElement | null>(null);

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const [notification, setNotification] = useState<{
    kind: 'success' | 'error';
    message: string;
  } | null>(null);

  const requiredFields = useMemo(
    () => ['firstName', 'lastName', 'email', 'phone', 'address', 'education', 'workExperience'],
    []
  );

  function setField(name: string, value: string) {
    setValues((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setNotification(null);

    const errors: FieldErrors = {};

    for (const field of requiredFields) {
      const v = (values as any)[field] as string;
      if (!isNonEmpty(v)) errors[field] = 'Este campo es obligatorio.';
    }

    if (isNonEmpty(values.email) && !isValidEmail(values.email)) {
      errors.email = 'El email no tiene un formato valido.';
    }

    if (cvFile) {
      const cvError = getCvError(cvFile);
      if (cvError) errors.cv = cvError;
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('firstName', values.firstName);
      formData.append('lastName', values.lastName);
      formData.append('email', values.email);
      formData.append('phone', values.phone);
      formData.append('address', values.address);
      formData.append('education', values.education);
      formData.append('workExperience', values.workExperience);

      if (cvFile) formData.append('cv', cvFile);

      const response = await fetch(`${BACKEND_URL}/api/candidates`, {
        method: 'POST',
        body: formData,
      });

      let payload: any = null;
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }

      if (response.status === 201) {
        setFieldErrors({});
        setNotification({
          kind: 'success',
          message: payload?.message ?? 'Candidato creado con exito.',
        });
        // Si quieres, se puede limpiar el formulario tras exito:
        setValues({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          address: '',
          education: '',
          workExperience: '',
        });
        setCvFile(null);
        if (cvInputRef.current) {
          cvInputRef.current.value = '';
        }
        return;
      }

      if (response.status === 409) {
        setNotification({
          kind: 'error',
          message: payload?.message ?? 'Ya existe un candidato con ese email.',
        });
        return;
      }

      if (response.status === 400) {
        const backendErrors: Record<string, string> | undefined = payload?.errors;
        setFieldErrors(backendErrors ?? {});
        setNotification({
          kind: 'error',
          message: payload?.message ?? 'La validacion fallo.',
        });
        return;
      }

      setNotification({
        kind: 'error',
        message: payload?.message ?? 'No se pudo guardar el candidato. Intenta de nuevo.',
      });
    } catch (err) {
      setNotification({
        kind: 'error',
        message: 'Error de red. No se pudo contactar con el servidor.',
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page">
      <div className="container">
        <div className="card">
          <h2>Anadir candidato</h2>
          {notification ? (
            <div className="notification-wrapper">
              <Notification
                kind={notification.kind}
                message={notification.message}
                onClose={() => setNotification(null)}
              />
            </div>
          ) : null}

          <form onSubmit={onSubmit} className="form">
            <div className="formGrid">
              <div className="field">
                <label htmlFor="firstName">Nombre</label>
                <input
                  id="firstName"
                  value={values.firstName}
                  onChange={(e) => setField('firstName', e.target.value)}
                  type="text"
                  required
                />
                {fieldErrors.firstName ? (
                  <div className="field-error">{fieldErrors.firstName}</div>
                ) : null}
              </div>

              <div className="field">
                <label htmlFor="lastName">Apellido</label>
                <input
                  id="lastName"
                  value={values.lastName}
                  onChange={(e) => setField('lastName', e.target.value)}
                  type="text"
                  required
                />
                {fieldErrors.lastName ? (
                  <div className="field-error">{fieldErrors.lastName}</div>
                ) : null}
              </div>

              <div className="field">
                <label htmlFor="email">Correo electronico</label>
                <input
                  id="email"
                  value={values.email}
                  onChange={(e) => setField('email', e.target.value)}
                  type="email"
                  required
                />
                {fieldErrors.email ? (
                  <div className="field-error">{fieldErrors.email}</div>
                ) : null}
              </div>

              <div className="field">
                <label htmlFor="phone">Telefono</label>
                <input
                  id="phone"
                  value={values.phone}
                  onChange={(e) => setField('phone', e.target.value)}
                  type="text"
                  required
                />
                {fieldErrors.phone ? (
                  <div className="field-error">{fieldErrors.phone}</div>
                ) : null}
              </div>

              <div className="field formSpan">
                <label htmlFor="address">Direccion</label>
                <input
                  id="address"
                  value={values.address}
                  onChange={(e) => setField('address', e.target.value)}
                  type="text"
                  required
                />
                {fieldErrors.address ? (
                  <div className="field-error">{fieldErrors.address}</div>
                ) : null}
              </div>

              <div className="field formSpan">
                <label htmlFor="education">Educacion</label>
                <input
                  id="education"
                  value={values.education}
                  onChange={(e) => setField('education', e.target.value)}
                  type="text"
                  required
                />
                {fieldErrors.education ? (
                  <div className="field-error">{fieldErrors.education}</div>
                ) : null}
              </div>

              <div className="field formSpan">
                <label htmlFor="workExperience">Experiencia laboral</label>
                <input
                  id="workExperience"
                  value={values.workExperience}
                  onChange={(e) =>
                    setField('workExperience', e.target.value)
                  }
                  type="text"
                  required
                />
                {fieldErrors.workExperience ? (
                  <div className="field-error">{fieldErrors.workExperience}</div>
                ) : null}
              </div>

              <div className="field formSpan">
                <label htmlFor="cv">CV (opcional)</label>
                <input
                  ref={cvInputRef}
                  id="cv"
                  type="file"
                  accept=".pdf,.docx"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    setCvFile(file);
                    setFieldErrors((prev) => ({ ...prev, cv: undefined }));
                    setNotification(null);
                  }}
                />
                {fieldErrors.cv ? <div className="field-error">{fieldErrors.cv}</div> : null}
              </div>
            </div>

            <div className="actions">
              <button type="button" className="btn secondary" onClick={props.onCancel} disabled={submitting}>
                Volver
              </button>
              <button type="submit" className="btn primary" disabled={submitting}>
                {submitting ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


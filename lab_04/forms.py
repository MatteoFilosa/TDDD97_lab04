class ForgotForm(Form):
    email = EmailField('Email address',
    [validators.DataRequired(), validators.Email()]
    )

class PasswordResetForm(Form):
    current_password = PasswordField('Current Password',
    [validators.DataRequired(),
    validators.Length(min=4, max=80)]
    )

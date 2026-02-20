"use client"

import * as React from "react"
import {
    Input as AriaInput,
    InputProps as AriaInputProps,
    TextField as AriaTextField,
    TextFieldProps as AriaTextFieldProps,
    ValidationResult as AriaValidationResult,
    composeRenderProps,
    Text,
} from "react-aria-components"

import { cn } from "@/lib/utils"
import { FieldError, FieldGroup, Label } from "@/components/ui/field"

const TextField = AriaTextField

const inputVariants = "w-full min-w-0 bg-transparent px-3 py-2 text-sm outline outline-0 placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden"

function Input({ className, ...props }: AriaInputProps) {
    return (
        <AriaInput
            className={composeRenderProps(className, (className) =>
                cn(inputVariants, className)
            )}
            {...props}
        />
    )
}

interface JollyTextFieldProps extends AriaTextFieldProps {
    label?: string
    description?: string
    errorMessage?: string | ((validation: AriaValidationResult) => string)
}

function JollyTextField({
    label,
    description,
    errorMessage,
    className,
    ...props
}: JollyTextFieldProps) {
    return (
        <TextField
            className={composeRenderProps(className, (className) =>
                cn("group flex flex-col gap-2", className)
            )}
            {...props}
        >
            {label && <Label>{label}</Label>}
            <FieldGroup>
                <Input />
            </FieldGroup>
            {description && (
                <Text className="text-sm text-muted-foreground" slot="description">
                    {description}
                </Text>
            )}
            <FieldError>{errorMessage}</FieldError>
        </TextField>
    )
}

export {
    Input,
    TextField,
    JollyTextField,
}
export type { JollyTextFieldProps }

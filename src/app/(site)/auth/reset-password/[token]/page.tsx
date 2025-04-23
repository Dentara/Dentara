import React from "react";
import ResetPassword from "@/components/Auth/ResetPassword";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

const ResetPasswordPage = async (props: { params: Promise<{ token: string }> }) => {
  const params = await props.params;
  return (
    <>
      <DefaultLayout>
        <ResetPassword token={params.token} />
      </DefaultLayout>
    </>
  );
};

export default ResetPasswordPage;

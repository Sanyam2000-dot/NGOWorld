import Cookies from "js-cookie";
import React, { useEffect, useState } from "react";
import { IoMdCloseCircleOutline } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";

import { useSWRConfig } from "swr";
import { ProfileElements } from "../../../constants";
import { clubEndpoints } from "../../../integrations/ApiEndpoints";
import { updateUserData } from "../../../redux/slice/userSlice";
import { UpdateUser } from "../../../service/MilanApi";
import { showErrorToast, showSuccessToast } from "../../../utils/Toasts";
import getProfileFields from "../../../utils/getProfileFields";
import Button from "../buttons/globalbutton/Button";
import "./ProfileCompletion.scss";

const ProfileCompletion = ({
  setShowProfileModal,
  editProfile,
  seteditProfile,
}) => {
  const [currentStep, setcurrentStep] = useState(2);
  const [currentIndex, setcurrentIndex] = useState(0);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const { mutate } = useSWRConfig();

  useEffect(() => {
    if (editProfile) {
      setFormData(user);
    }
  }, [editProfile]);

  const fields = getProfileFields(user, editProfile);

  const totalfields = fields.length;

  const handleIncrementStep = () => {
    if (currentStep + 2 <= totalfields) {
      setcurrentIndex(currentIndex + 2);
      setcurrentStep(currentStep + 2);
    }
  };

  const handleDecrementStep = () => {
    if (currentStep - 2 >= 2) {
      setcurrentIndex(currentIndex - 2);
      setcurrentStep(currentStep - 2);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await UpdateUser(formData);
    if (response?.status !== 200) {
      showErrorToast(response?.data?.message);
    } else {
      dispatch(updateUserData(formData));
      setFormData({});
      setShowProfileModal(false);
      seteditProfile(false);
      showSuccessToast(response?.data?.message);
      mutate(clubEndpoints.details(user?.userName));
    }
  };

  return (
    <div className="profilecompletion_overlay">
      <div className="profilecompletion_modal">
        <IoMdCloseCircleOutline
          className="crossButton"
          onClick={() => {
            setShowProfileModal(false);
            seteditProfile(false);
            Cookies.set("skipProfileCompletion", "true", { expires: 7 });
          }}
        />

        <div className="profilecompletion_header">
          <h1> {editProfile ? "Edit Profile" : `We're almost done`} </h1>
          {!editProfile && (
            <p>
              Please complete your profile to enjoy the full benefits of the
              platform
            </p>
          )}
        </div>

        <form>
          {fields.slice(currentIndex, currentIndex + 2).map((elId) => {
            const formElement = ProfileElements.find(
              (element) => element.id === elId,
            );

            return (
              <div className="profilecompletion_element" key={formElement.id}>
                <label>{formElement?.label}</label>
                {formElement?.id === "description" ? (
                  <textarea
                    type={formElement?.type}
                    name={formElement?.id}
                    value={formData[formElement?.id] || ""}
                    onChange={handleChange}
                    className="auth_input"
                    placeholder={formElement?.placeholder}
                  />
                ) : (
                  <input
                    type={formElement?.type}
                    name={formElement?.id}
                    value={formData[formElement?.id] || ""}
                    onChange={handleChange}
                    className="auth_input"
                    placeholder={formElement?.placeholder}
                  />
                )}
              </div>
            );
          })}
        </form>

        <div className="profilecompletion_btndiv">
          <Button
            variant="solid"
            disabled={currentStep === 2}
            onClickfunction={handleDecrementStep}
          >
            Previous
          </Button>
          {currentStep == totalfields ? (
            <Button variant="solid" onClickfunction={handleSubmit}>
              Finish
            </Button>
          ) : (
            <Button variant="solid" onClickfunction={handleIncrementStep}>
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileCompletion;
